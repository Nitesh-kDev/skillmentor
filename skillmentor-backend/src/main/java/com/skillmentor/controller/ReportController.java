package com.skillmentor.controller;

import com.skillmentor.dto.AdminDtos.*;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ReportDto> submitReport(Authentication authentication, @RequestBody ReportRequest request) {
        User reporter = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(adminService.submitReport(reporter.getId(), request));
    }
}
