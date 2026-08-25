package com.skillmentor.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.skillmentor.dto.WalletPaymentDtos.*;
import com.skillmentor.exception.BadRequestException;
import com.skillmentor.exception.ResourceNotFoundException;
import com.skillmentor.exception.UnauthorizedAccessException;
import com.skillmentor.model.*;
import com.skillmentor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final MentorshipSessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Transactional
    public RazorpayOrderResponse createRazorpayOrder(Long studentId, RazorpayOrderRequest request) {
        if (request.getSessionId() == null) {
            throw new IllegalArgumentException("Session ID is required to create a payment order");
        }

        MentorshipSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + request.getSessionId()));

        // Authenticated user authorization check
        if (!session.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedAccessException("You are not authorized to initialize payment for this session");
        }

        // Production-level Idempotency Check: Reject order creation if already paid
        paymentRepository.findBySession(session).ifPresent(p -> {
            if (p.getStatus() == Payment.PaymentStatus.SUCCESS) {
                throw new BadRequestException("This mentorship session has already been paid for and confirmed.");
            }
        });

        if (session.getStatus() == MentorshipSession.SessionStatus.REJECTED || session.getStatus() == MentorshipSession.SessionStatus.CANCELLED) {
            throw new BadRequestException("Cannot initialize payment order for a " + session.getStatus() + " session.");
        }

        // Authoritative Price Calculation (Client-supplied amount is IGNORED for security)
        Double amountInINR = session.getPriceInINR();
        if (Boolean.FALSE.equals(session.getPaymentRequired()) || amountInINR == null || amountInINR <= 0) {
            throw new BadRequestException("This session does not require online payment (Free Alumni Guidance Session).");
        }

        // Amount in paise (minimum 100 paise = ₹1)
        long amountInPaise = Math.max(100, Math.round(amountInINR * 100));

        String cleanKeyId = getCleanKeyId();
        String cleanKeySecret = getCleanKeySecret();

        String razorpayOrderId;
        try {
            RazorpayClient razorpay = new RazorpayClient(cleanKeyId, cleanKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_session_" + session.getId());

            Order order = razorpay.orders.create(orderRequest);
            razorpayOrderId = order.get("id");
            log.info("RAZORPAY ORDER CREATED SUCCESSFULLY: {}", razorpayOrderId);
        } catch (Exception e) {
            log.error("Razorpay SDK Order Creation Error for KeyID [{}]: {}", cleanKeyId, e.getMessage(), e);
            throw new BadRequestException("Failed to initialize Razorpay payment order: " + (e.getMessage() != null ? e.getMessage() : e.toString()));
        }

        Payment payment = paymentRepository.findBySession(session)
                .orElse(Payment.builder()
                        .session(session)
                        .student(session.getStudent())
                        .mentor(session.getMentor())
                        .amount(amountInINR)
                        .currency("INR")
                        .build());

        payment.setAmount(amountInINR);
        payment.setStatus(Payment.PaymentStatus.INITIATED);
        payment.setRazorpayOrderId(razorpayOrderId);
        paymentRepository.save(payment);

        return RazorpayOrderResponse.builder()
                .orderId(razorpayOrderId)
                .razorpayOrderId(razorpayOrderId)
                .amount(amountInINR)
                .currency("INR")
                .keyId(cleanKeyId)
                .sessionId(session.getId())
                .build();
    }

    @Transactional
    public boolean verifyRazorpayPayment(Long studentId, RazorpayVerifyRequest request) {
        String orderId = request.getRazorpayOrderId();
        if (orderId == null || request.getRazorpayPaymentId() == null || request.getRazorpaySignature() == null) {
            throw new IllegalArgumentException("Missing required payment verification fields");
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order: " + orderId));

        // Authenticated user authorization check
        if (!payment.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedAccessException("You are not authorized to verify payment for this session");
        }

        // Validate session ID matching if provided by client
        if (request.getSessionId() != null && !request.getSessionId().equals(payment.getSession().getId())) {
            throw new BadRequestException("Submitted session ID does not match stored payment order session");
        }

        // Replay & Duplicate Payment Protection
        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            if (request.getRazorpayPaymentId().equals(payment.getRazorpayPaymentId())) {
                log.info("Payment order {} already successfully processed.", orderId);
                return true;
            }
        }

        if (paymentRepository.existsByRazorpayPaymentId(request.getRazorpayPaymentId())) {
            Payment existing = paymentRepository.findByRazorpayPaymentId(request.getRazorpayPaymentId()).orElse(null);
            if (existing != null && !existing.getId().equals(payment.getId())) {
                log.error("Razorpay payment ID {} already associated with another payment record", request.getRazorpayPaymentId());
                throw new BadRequestException("Duplicate Razorpay payment ID submitted.");
            }
        }

        // Cryptographic HMAC Signature Verification (NO mock string prefix bypasses)
        boolean isValid = verifySignature(
                orderId,
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                getCleanKeySecret()
        );

        if (isValid) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            paymentRepository.save(payment);

            // Transition mentorship session status to ACCEPTED
            MentorshipSession session = payment.getSession();
            session.setStatus(MentorshipSession.SessionStatus.ACCEPTED);
            sessionRepository.save(session);

            return true;
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return false;
        }
    }

    public List<PaymentDto> getPaymentHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Payment> payments = paymentRepository.findByStudent(user);
        payments.addAll(paymentRepository.findByMentor(user));

        return payments.stream().map(p -> PaymentDto.builder()
                .id(p.getId())
                .sessionId(p.getSession().getId())
                .studentId(p.getStudent().getId())
                .studentName(p.getStudent().getName())
                .mentorId(p.getMentor().getId())
                .mentorName(p.getMentor().getName())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .createdAt(p.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    private boolean verifySignature(String orderId, String paymentId, String signature, String secret) {
        if (signature == null || signature.trim().isEmpty() || secret == null || secret.trim().isEmpty()) {
            return false;
        }
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);
            
            return Utils.verifyPaymentSignature(attributes, secret);
        } catch (Exception e) {
            try {
                String payload = orderId + "|" + paymentId;
                Mac mac = Mac.getInstance("HmacSHA256");
                SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
                mac.init(secretKeySpec);
                byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
                
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) hexString.append('0');
                    hexString.append(hex);
                }
                return hexString.toString().equalsIgnoreCase(signature);
            } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
                return false;
            }
        }
    }

    private String getCleanKeyId() {
        return (razorpayKeyId != null && !razorpayKeyId.trim().isEmpty())
                ? razorpayKeyId.trim()
                : "";
    }

    private String getCleanKeySecret() {
        return (razorpayKeySecret != null && !razorpayKeySecret.trim().isEmpty())
                ? razorpayKeySecret.trim()
                : "";
    }
}
