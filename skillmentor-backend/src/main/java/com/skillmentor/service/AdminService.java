package com.skillmentor.service;

import com.skillmentor.dto.AdminDtos.*;
import com.skillmentor.model.*;
import com.skillmentor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final MentorVerificationRepository verificationRepository;
    private final MentorshipSessionRepository sessionRepository;
    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final UserSkillRepository userSkillRepository;
    private final ReportRepository reportRepository;
    private final AdminActionLogRepository actionLogRepository;

    public AdminSummaryDto getAdminSummary() {
        long totalUsers = userRepository.count();
        long totalSessions = sessionRepository.count();

        double successfulRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS)
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        long peerCreditsTransferred = sessionRepository.findAll().stream()
                .filter(s -> s.getSessionType() == MentorshipSession.SessionType.PEER_CREDIT &&
                             (s.getStatus() == MentorshipSession.SessionStatus.COMPLETED || s.getStatus() == MentorshipSession.SessionStatus.ACCEPTED))
                .mapToLong(s -> s.getCreditCost() != null ? s.getCreditCost() : 0)
                .sum();

        long pendingVerifications = verificationRepository.findByStage(MentorVerification.VerificationStage.PENDING).size();
        long pendingReports = reportRepository.findByStatus(Report.ReportStatus.PENDING).size();

        return AdminSummaryDto.builder()
                .totalUsers(totalUsers)
                .totalSessions(totalSessions)
                .successfulRevenue(Math.round(successfulRevenue * 100.0) / 100.0)
                .peerCreditsTransferred(peerCreditsTransferred)
                .pendingVerifications(pendingVerifications)
                .pendingReports(pendingReports)
                .build();
    }

    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> AdminUserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .collegeName(u.getCollegeName())
                        .currentCompany(u.getCurrentCompany())
                        .currentDesignation(u.getCurrentDesignation())
                        .verificationStatus(u.getVerificationStatus())
                        .isSuspended(Boolean.TRUE.equals(u.getIsSuspended()))
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<MentorVerificationDto> getAllVerifications() {
        return verificationRepository.findAll().stream()
                .map(v -> MentorVerificationDto.builder()
                        .id(v.getId())
                        .userId(v.getUser() != null ? v.getUser().getId() : null)
                        .userName(v.getUser() != null ? v.getUser().getName() : "Mentor User")
                        .userEmail(v.getUser() != null ? v.getUser().getEmail() : "N/A")
                        .college(v.getUser() != null ? v.getUser().getCollegeName() : "N/A")
                        .company(v.getCompany() != null ? v.getCompany() : (v.getUser() != null ? v.getUser().getCurrentCompany() : null))
                        .designation(v.getDesignation() != null ? v.getDesignation() : (v.getUser() != null ? v.getUser().getCurrentDesignation() : null))
                        .experienceYears(v.getExperienceYears() != null ? v.getExperienceYears() : 3)
                        .linkedinUrl(v.getLinkedinUrl() != null ? v.getLinkedinUrl() : (v.getUser() != null ? v.getUser().getLinkedinUrl() : null))
                        .govtIdDocumentPath(v.getGovtIdDocumentPath() != null ? v.getGovtIdDocumentPath() : (v.getUser() != null ? v.getUser().getGovtIdUrl() : null))
                        .stage(v.getStage() != null ? v.getStage().name() : "PENDING")
                        .submittedAt(v.getSubmittedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<PaymentRecordDto> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(p -> PaymentRecordDto.builder()
                        .id(p.getId())
                        .transactionId("TXN-" + p.getId())
                        .razorpayOrderId(p.getRazorpayOrderId() != null ? p.getRazorpayOrderId() : "N/A")
                        .razorpayPaymentId(p.getRazorpayPaymentId() != null ? p.getRazorpayPaymentId() : "N/A")
                        .studentName(p.getStudent() != null ? p.getStudent().getName() : "Student")
                        .mentorName(p.getMentor() != null ? p.getMentor().getName() : "Mentor")
                        .amount(p.getAmount() != null ? p.getAmount() : 0.0)
                        .status(p.getStatus() != null ? p.getStatus().name() : "PENDING")
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public MentorVerificationDto processMentorVerification(Long adminId, Long targetId, boolean approve, String notes) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        MentorVerification verification = verificationRepository.findById(targetId).orElse(null);
        User targetUser = null;

        if (verification != null) {
            targetUser = verification.getUser();
            verification.setStage(approve ? MentorVerification.VerificationStage.APPROVED : MentorVerification.VerificationStage.REJECTED);
            verification.setReviewerNotes(notes);
            verificationRepository.save(verification);
        } else {
            targetUser = userRepository.findById(targetId).orElse(null);
            if (targetUser == null) {
                verification = verificationRepository.findAll().stream()
                        .filter(v -> v.getUser() != null && v.getUser().getId().equals(targetId))
                        .findFirst().orElse(null);
                if (verification != null) {
                    targetUser = verification.getUser();
                    verification.setStage(approve ? MentorVerification.VerificationStage.APPROVED : MentorVerification.VerificationStage.REJECTED);
                    verification.setReviewerNotes(notes);
                    verificationRepository.save(verification);
                }
            }
        }

        if (targetUser == null) {
            throw new RuntimeException("Target user or verification record #" + targetId + " not found!");
        }

        targetUser.setVerificationStatus(approve ? User.VerificationStatus.VERIFIED : User.VerificationStatus.REJECTED);
        userRepository.save(targetUser);

        // Audit Log
        actionLogRepository.save(AdminActionLog.builder()
                .admin(admin)
                .targetUser(targetUser)
                .actionType(approve ? "VERIFY_MENTOR" : "REJECT_MENTOR")
                .details(notes != null && !notes.trim().isEmpty() ? notes : (approve ? "Approved mentor verification badge" : "Rejected mentor verification request"))
                .build());

        return MentorVerificationDto.builder()
                .id(verification != null ? verification.getId() : targetUser.getId())
                .userId(targetUser.getId())
                .userName(targetUser.getName())
                .userEmail(targetUser.getEmail())
                .company(targetUser.getCurrentCompany())
                .designation(targetUser.getCurrentDesignation())
                .experienceYears(verification != null ? verification.getExperienceYears() : 3)
                .linkedinUrl(targetUser.getLinkedinUrl())
                .govtIdDocumentPath(targetUser.getGovtIdUrl())
                .stage(targetUser.getVerificationStatus().name())
                .build();
    }

    @Transactional
    public ReportDto submitReport(Long reporterId, ReportRequest request) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter user not found"));

        User reported = userRepository.findById(request.getReportedUserId())
                .orElseThrow(() -> new RuntimeException("Reported user not found"));

        Report report = Report.builder()
                .reportedBy(reporter)
                .reportedUser(reported)
                .reason(request.getReason())
                .status(Report.ReportStatus.PENDING)
                .build();

        report = reportRepository.save(report);

        return mapToReportDto(report);
    }

    public List<ReportDto> getReports(Report.ReportStatus status) {
        List<Report> reports = status != null ?
                reportRepository.findByStatus(status) : reportRepository.findAll();

        return reports.stream().map(this::mapToReportDto).collect(Collectors.toList());
    }

    @Transactional
    public ReportDto resolveReport(Long adminId, Long reportId, boolean dismiss, String notes) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(dismiss ? Report.ReportStatus.DISMISSED : Report.ReportStatus.RESOLVED);
        report.setResolutionNotes(notes);
        report = reportRepository.save(report);

        // Audit Log
        actionLogRepository.save(AdminActionLog.builder()
                .admin(admin)
                .targetUser(report.getReportedUser())
                .actionType("RESOLVE_REPORT")
                .details("Report #" + reportId + " status set to " + report.getStatus() + ". Notes: " + notes)
                .build());

        return mapToReportDto(report);
    }

    @Transactional
    public boolean toggleUserSuspension(Long adminId, Long targetUserId, boolean suspend, String reason) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        targetUser.setIsSuspended(suspend);
        userRepository.save(targetUser);

        // Audit Log
        actionLogRepository.save(AdminActionLog.builder()
                .admin(admin)
                .targetUser(targetUser)
                .actionType(suspend ? "SUSPEND_USER" : "UNSUSPEND_USER")
                .details("User suspension set to " + suspend + ". Reason: " + reason)
                .build());

        return suspend;
    }

    public PlatformAnalyticsDto getPlatformAnalytics() {
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.findByRole(User.Role.STUDENT).size();
        long totalMentors = userRepository.findByRole(User.Role.MENTOR).size();
        long totalAlumni = userRepository.findByRole(User.Role.ALUMNI).size();

        long totalSessions = sessionRepository.count();
        long completedSessions = sessionRepository.findAll().stream()
                .filter(s -> s.getStatus() == MentorshipSession.SessionStatus.COMPLETED)
                .count();

        long pendingVerifications = verificationRepository.findByStage(MentorVerification.VerificationStage.PENDING).size();
        long pendingReports = reportRepository.findByStatus(Report.ReportStatus.PENDING).size();

        double totalRevenueINR = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum();

        long totalCreditVolume = walletRepository.findAll().stream()
                .mapToLong(Wallet::getCreditBalance)
                .sum();

        List<String> topSkills = userSkillRepository.findAll().stream()
                .map(UserSkill::getSkillName)
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        return PlatformAnalyticsDto.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalMentors(totalMentors)
                .totalAlumni(totalAlumni)
                .totalSessions(totalSessions)
                .completedSessions(completedSessions)
                .pendingVerifications(pendingVerifications)
                .pendingReports(pendingReports)
                .totalRevenueINR(totalRevenueINR)
                .totalCreditVolume(totalCreditVolume)
                .topSkills(topSkills)
                .build();
    }

    public List<AdminActionLogDto> getAdminActionLogs() {
        return actionLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(log -> AdminActionLogDto.builder()
                        .id(log.getId())
                        .adminId(log.getAdmin().getId())
                        .adminName(log.getAdmin().getName())
                        .targetUserId(log.getTargetUser() != null ? log.getTargetUser().getId() : null)
                        .targetUserName(log.getTargetUser() != null ? log.getTargetUser().getName() : "N/A")
                        .actionType(log.getActionType())
                        .details(log.getDetails())
                        .timestamp(log.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    private ReportDto mapToReportDto(Report report) {
        return ReportDto.builder()
                .id(report.getId())
                .reportedUserId(report.getReportedUser().getId())
                .reportedUserName(report.getReportedUser().getName())
                .reportedUserEmail(report.getReportedUser().getEmail())
                .reportedById(report.getReportedBy().getId())
                .reportedByName(report.getReportedBy().getName())
                .reason(report.getReason())
                .status(report.getStatus())
                .resolutionNotes(report.getResolutionNotes())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
