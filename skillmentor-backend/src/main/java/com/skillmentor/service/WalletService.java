package com.skillmentor.service;

import com.skillmentor.dto.WalletPaymentDtos.*;
import com.skillmentor.model.*;
import com.skillmentor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final MentorshipSessionRepository sessionRepository;
    private final PaymentRepository paymentRepository;

    public Wallet getWalletByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return walletRepository.findByUser(user)
                .orElseGet(() -> walletRepository.save(Wallet.builder().user(user).creditBalance(50).build()));
    }

    @Transactional(readOnly = true)
    public WalletSummaryDto getWalletSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Wallet wallet = getWalletByUserId(userId);
        int availableCredits = wallet.getCreditBalance() != null ? wallet.getCreditBalance() : 0;

        int earnedCredits = 50; // Initial welcome bonus on registration
        int spentCredits = 0;
        int pendingCredits = 0;

        List<CreditActivityDto> activities = new ArrayList<>();

        // 1. Add Registration Welcome Bonus Activity
        activities.add(CreditActivityDto.builder()
                .id(0L)
                .activityTitle("Welcome Bonus Credits")
                .partnerName("SkillMentor Platform")
                .type("WELCOME_BONUS")
                .credits(50)
                .formattedCredits("+50")
                .status("COMPLETED")
                .date(user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now().minusDays(30))
                .build());

        // 2. Process Peer Credit Sessions for credit metrics & activities
        List<MentorshipSession> peerSessions = sessionRepository.findByStudentOrMentor(user, user)
                .stream()
                .filter(s -> s.getSessionType() == MentorshipSession.SessionType.PEER_CREDIT)
                .collect(Collectors.toList());

        for (MentorshipSession s : peerSessions) {
            int cost = s.getCreditCost() != null ? s.getCreditCost() : 10;
            boolean isStudent = user.getId().equals(s.getStudent().getId());
            String partnerName = isStudent ? (s.getMentor() != null ? s.getMentor().getName() : "Peer")
                                           : (s.getStudent() != null ? s.getStudent().getName() : "Peer");

            if (isStudent) {
                // User spent credits or requested peer help
                if (s.getStatus() == MentorshipSession.SessionStatus.COMPLETED || s.getStatus() == MentorshipSession.SessionStatus.ACCEPTED) {
                    spentCredits += cost;
                    activities.add(CreditActivityDto.builder()
                            .id(s.getId())
                            .activityTitle(s.getTitle() != null ? s.getTitle() : "Peer Skill Swap")
                            .partnerName(partnerName)
                            .type("SPENT")
                            .credits(cost)
                            .formattedCredits("-" + cost)
                            .status("COMPLETED")
                            .date(s.getCreatedAt())
                            .build());
                } else if (s.getStatus() == MentorshipSession.SessionStatus.PENDING) {
                    pendingCredits += cost;
                    activities.add(CreditActivityDto.builder()
                            .id(s.getId())
                            .activityTitle(s.getTitle() != null ? s.getTitle() : "Peer Skill Swap")
                            .partnerName(partnerName)
                            .type("PENDING_SPENT")
                            .credits(cost)
                            .formattedCredits("-" + cost)
                            .status("PENDING")
                            .date(s.getCreatedAt())
                            .build());
                } else if (s.getStatus() == MentorshipSession.SessionStatus.CANCELLED || s.getStatus() == MentorshipSession.SessionStatus.REJECTED) {
                    activities.add(CreditActivityDto.builder()
                            .id(s.getId())
                            .activityTitle(s.getTitle() != null ? s.getTitle() : "Peer Skill Swap")
                            .partnerName(partnerName)
                            .type("SPENT")
                            .credits(cost)
                            .formattedCredits("0")
                            .status("CANCELLED")
                            .date(s.getCreatedAt())
                            .build());
                }
            } else {
                // User earned credits by helping peer
                if (s.getStatus() == MentorshipSession.SessionStatus.COMPLETED || s.getStatus() == MentorshipSession.SessionStatus.ACCEPTED) {
                    earnedCredits += cost;
                    activities.add(CreditActivityDto.builder()
                            .id(s.getId())
                            .activityTitle(s.getTitle() != null ? s.getTitle() : "Peer Skill Swap")
                            .partnerName(partnerName)
                            .type("EARNED")
                            .credits(cost)
                            .formattedCredits("+" + cost)
                            .status("COMPLETED")
                            .date(s.getCreatedAt())
                            .build());
                } else if (s.getStatus() == MentorshipSession.SessionStatus.PENDING) {
                    activities.add(CreditActivityDto.builder()
                            .id(s.getId())
                            .activityTitle(s.getTitle() != null ? s.getTitle() : "Peer Skill Swap")
                            .partnerName(partnerName)
                            .type("EARNED")
                            .credits(cost)
                            .formattedCredits("+" + cost)
                            .status("PENDING")
                            .date(s.getCreatedAt())
                            .build());
                }
            }
        }

        // Sort activities by date descending
        activities.sort(Comparator.comparing(CreditActivityDto::getDate, Comparator.nullsLast(Comparator.naturalOrder())).reversed());

        // 3. Process Mentorship Real-Money Payments
        List<Payment> studentPayments = paymentRepository.findByStudent(user);
        double totalPaidINR = 0.0;
        long successfulCount = 0;
        long pendingCount = 0;
        long failedCount = 0;

        List<PaymentDto> mentorshipPayments = new ArrayList<>();

        for (Payment p : studentPayments) {
            if (p.getStatus() == Payment.PaymentStatus.SUCCESS) {
                totalPaidINR += (p.getAmount() != null ? p.getAmount() : 0.0);
                successfulCount++;
            } else if (p.getStatus() == Payment.PaymentStatus.INITIATED) {
                pendingCount++;
            } else if (p.getStatus() == Payment.PaymentStatus.FAILED) {
                failedCount++;
            }

            mentorshipPayments.add(PaymentDto.builder()
                    .id(p.getId())
                    .sessionId(p.getSession() != null ? p.getSession().getId() : null)
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
                    .build());
        }

        mentorshipPayments.sort(Comparator.comparing(PaymentDto::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed());

        return WalletSummaryDto.builder()
                .availableCredits(availableCredits)
                .earnedCredits(earnedCredits)
                .spentCredits(spentCredits)
                .pendingCredits(pendingCredits)
                .totalPaidINR(Math.round(totalPaidINR * 100.0) / 100.0)
                .successfulPaymentsCount(successfulCount)
                .pendingPaymentsCount(pendingCount)
                .failedPaymentsCount(failedCount)
                .creditActivities(activities)
                .mentorshipPayments(mentorshipPayments)
                .build();
    }

    /**
     * Atomic Peer-to-Peer Credit Transfer with Double Spend Protection
     */
    @Transactional
    public boolean transferCredits(Long senderUserId, Long recipientUserId, Integer amount, String reason) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Transfer amount must be greater than zero");
        }
        if (senderUserId.equals(recipientUserId)) {
            throw new IllegalArgumentException("Sender and recipient cannot be the same user");
        }

        // Check sender wallet
        Wallet senderWallet = getWalletByUserId(senderUserId);
        if (senderWallet.getCreditBalance() < amount) {
            throw new RuntimeException("Insufficient credit balance! Current balance: " + senderWallet.getCreditBalance() + " credits.");
        }

        // Perform atomic deduction at database level to prevent double-spending race condition
        int rowsUpdated = walletRepository.deductCreditsAtomic(senderUserId, amount);
        if (rowsUpdated == 0) {
            throw new RuntimeException("Credit transfer failed due to concurrent modification or insufficient balance.");
        }

        // Perform atomic credit addition to recipient
        getWalletByUserId(recipientUserId); // Ensure recipient wallet exists
        walletRepository.addCreditsAtomic(recipientUserId, amount);

        return true;
    }
}
