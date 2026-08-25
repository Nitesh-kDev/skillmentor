package com.skillmentor.dto;

import com.skillmentor.model.Report;
import com.skillmentor.model.User;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReportRequest {
        private Long reportedUserId;
        private String reason;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReportDto {
        private Long id;
        private Long reportedUserId;
        private String reportedUserName;
        private String reportedUserEmail;
        private Long reportedById;
        private String reportedByName;
        private String reason;
        private Report.ReportStatus status;
        private String resolutionNotes;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AdminActionLogDto {
        private Long id;
        private Long adminId;
        private String adminName;
        private Long targetUserId;
        private String targetUserName;
        private String actionType;
        private String details;
        private LocalDateTime timestamp;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MentorVerificationDto {
        private Long id;
        private Long userId;
        private String userName;
        private String userEmail;
        private String college;
        private String company;
        private String designation;
        private Integer experienceYears;
        private String linkedinUrl;
        private String govtIdDocumentPath;
        private String stage;
        private LocalDateTime submittedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PlatformAnalyticsDto {
        private Long totalUsers;
        private Long totalStudents;
        private Long totalMentors;
        private Long totalAlumni;
        private Long totalSessions;
        private Long completedSessions;
        private Long pendingVerifications;
        private Long pendingReports;
        private Double totalRevenueINR;
        private Long totalCreditVolume;
        private List<String> topSkills;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AdminUserDto {
        private Long id;
        private String name;
        private String email;
        private User.Role role;
        private String collegeName;
        private String currentCompany;
        private String currentDesignation;
        private User.VerificationStatus verificationStatus;
        private Boolean isSuspended;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentRecordDto {
        private Long id;
        private String transactionId;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String studentName;
        private String mentorName;
        private Double amount;
        private String status;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AdminSummaryDto {
        private Long totalUsers;
        private Long totalSessions;
        private Double successfulRevenue;
        private Long peerCreditsTransferred;
        private Long pendingVerifications;
        private Long pendingReports;
    }
}
