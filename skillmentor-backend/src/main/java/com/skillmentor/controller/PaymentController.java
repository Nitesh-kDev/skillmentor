package com.skillmentor.controller;

import com.skillmentor.dto.WalletPaymentDtos.*;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    // STEP 1 Endpoint: POST /api/payments/razorpay/order & alias /api/create-order
    @PostMapping({"/api/payments/razorpay/order", "/api/create-order"})
    public ResponseEntity<RazorpayOrderResponse> createOrder(Authentication authentication, @RequestBody RazorpayOrderRequest request) {
        User student = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(paymentService.createRazorpayOrder(student.getId(), request));
    }

    // STEP 3 Endpoint: POST /api/payments/razorpay/verify & alias /api/verify-payment
    @PostMapping({"/api/payments/razorpay/verify", "/api/verify-payment"})
    public ResponseEntity<Boolean> verifyPayment(Authentication authentication, @RequestBody RazorpayVerifyRequest request) {
        User student = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(paymentService.verifyRazorpayPayment(student.getId(), request));
    }

    @GetMapping("/api/payments/history")
    public ResponseEntity<List<PaymentDto>> getHistory(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(paymentService.getPaymentHistory(user.getId()));
    }
}
