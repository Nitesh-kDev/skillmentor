package com.skillmentor.controller;

import com.skillmentor.dto.AdminDtos.*;
import com.skillmentor.model.MentorVerification;
import com.skillmentor.model.Report;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public ResponseEntity<AdminSummaryDto> getAdminSummary() {
        return ResponseEntity.ok(adminService.getAdminSummary());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/verifications")
    public ResponseEntity<List<MentorVerificationDto>> getVerifications() {
        return ResponseEntity.ok(adminService.getAllVerifications());
    }

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentRecordDto>> getPayments() {
        return ResponseEntity.ok(adminService.getAllPayments());
    }

    @PostMapping("/verifications/{id}/process")
    public ResponseEntity<MentorVerificationDto> processVerification(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam boolean approve,
            @RequestParam(required = false) String notes) {
        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(adminService.processMentorVerification(admin.getId(), id, approve, notes));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ReportDto>> getReports(@RequestParam(required = false) Report.ReportStatus status) {
        return ResponseEntity.ok(adminService.getReports(status));
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<ReportDto> resolveReport(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean dismiss,
            @RequestParam(required = false) String notes) {
        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(adminService.resolveReport(admin.getId(), id, dismiss, notes));
    }

    @PostMapping("/users/{userId}/suspend")
    public ResponseEntity<Boolean> toggleUserSuspension(
            Authentication authentication,
            @PathVariable Long userId,
            @RequestParam boolean suspend,
            @RequestParam(required = false) String reason) {
        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(adminService.toggleUserSuspension(admin.getId(), userId, suspend, reason));
    }

    @GetMapping("/analytics")
    public ResponseEntity<PlatformAnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(adminService.getPlatformAnalytics());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AdminActionLogDto>> getActionLogs() {
        return ResponseEntity.ok(adminService.getAdminActionLogs());
    }
}
