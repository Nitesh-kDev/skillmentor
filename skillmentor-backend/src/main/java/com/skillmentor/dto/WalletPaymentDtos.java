package com.skillmentor.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skillmentor.model.Payment;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class WalletPaymentDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class WalletTransferRequest {
        private Long recipientUserId;
        private Integer amount;
        private String reason;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RazorpayOrderRequest {
        @JsonAlias({"sessionId", "session_id"})
        private Long sessionId;
        
        @JsonAlias({"amount", "amount_paise"})
        private Double amount; // Accepts amount in paise or INR

        @JsonAlias({"currency"})
        private String currency;

        @JsonAlias({"receipt"})
        private String receipt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RazorpayOrderResponse {
        @JsonProperty("order_id")
        private String orderId;

        @JsonProperty("razorpay_order_id")
        private String razorpayOrderId;

        private Double amount; // amount in INR
        private String currency;

        @JsonProperty("key_id")
        private String keyId;

        @JsonProperty("session_id")
        private Long sessionId;

        // Extra getters to ensure JavaScript receives camelCase as well if requested
        public String getRazorpayOrderIdCamel() { return razorpayOrderId != null ? razorpayOrderId : orderId; }
        public String getKeyIdCamel() { return keyId; }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RazorpayVerifyRequest {
        @JsonAlias({"razorpay_order_id", "order_id", "razorpayOrderId"})
        private String razorpayOrderId;

        @JsonAlias({"razorpay_payment_id", "payment_id", "razorpayPaymentId"})
        private String razorpayPaymentId;

        @JsonAlias({"razorpay_signature", "signature", "razorpaySignature"})
        private String razorpaySignature;

        @JsonAlias({"sessionId", "session_id"})
        private Long sessionId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentDto {
        private Long id;
        private Long sessionId;
        private Long studentId;
        private String studentName;
        private Long mentorId;
        private String mentorName;
        private Double amount;
        private String currency;
        private Payment.PaymentStatus status;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreditActivityDto {
        private Long id;
        private String activityTitle;
        private String partnerName;
        private String type; // "EARNED", "SPENT", "PENDING_SPENT", "WELCOME_BONUS"
        private Integer credits;
        private String formattedCredits; // e.g. "+10", "-10", "+50"
        private String status; // "COMPLETED", "PENDING", "CANCELLED"
        private LocalDateTime date;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class WalletSummaryDto {
        private Integer availableCredits;
        private Integer earnedCredits;
        private Integer spentCredits;
        private Integer pendingCredits;
        private Double totalPaidINR;
        private Long successfulPaymentsCount;
        private Long pendingPaymentsCount;
        private Long failedPaymentsCount;
        private List<CreditActivityDto> creditActivities;
        private List<PaymentDto> mentorshipPayments;
    }
}
