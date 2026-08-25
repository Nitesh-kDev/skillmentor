package com.skillmentor.controller;

import com.skillmentor.dto.AdminDtos.MentorVerificationDto;
import com.skillmentor.model.MentorVerification;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/verifications")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;
    private final UserRepository userRepository;

    @PostMapping("/submit")
    public ResponseEntity<MentorVerification> submitVerification(
            Authentication authentication,
            @RequestParam("linkedinUrl") String linkedinUrl,
            @RequestParam(value = "company", required = false) String company,
            @RequestParam(value = "designation", required = false) String designation,
            @RequestParam(value = "experience", required = false) Integer experience,
            @RequestParam(value = "govtId", required = false) MultipartFile govtId) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String filePath = "uploads/govt_id_demo.pdf";
        if (govtId != null && !govtId.isEmpty()) {
            try {
                String uploadDir = "./uploads";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String filename = UUID.randomUUID() + "_" + govtId.getOriginalFilename();
                Path path = Paths.get(uploadDir, filename);
                Files.copy(govtId.getInputStream(), path);
                filePath = path.toString();
            } catch (IOException e) {
                // Ignore upload failure in demo mode
            }
        }

        MentorVerification verification = verificationService.submitMentorVerification(
                user.getId(), linkedinUrl, company, designation, experience, filePath);

        return ResponseEntity.ok(verification);
    }

    @PostMapping("/{verificationId}/process")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MentorVerificationDto> processApproval(
            Authentication authentication,
            @PathVariable Long verificationId,
            @RequestParam boolean approve,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(verificationService.processVerificationApproval(verificationId, approve, notes));
    }

    @GetMapping("/pending")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MentorVerificationDto>> getPendingVerifications(Authentication authentication) {
        return ResponseEntity.ok(verificationService.getPendingVerifications());
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<org.springframework.core.io.Resource> getVerificationDocument(
            Authentication authentication,
            @PathVariable Long id) {
        User requester = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new com.skillmentor.exception.ResourceNotFoundException("User not found"));

        MentorVerification verification = verificationService.getVerificationById(id);

        boolean isOwner = verification.getUser().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new com.skillmentor.exception.UnauthorizedAccessException("You are not authorized to access this document");
        }

        String docPath = verification.getGovtIdDocumentPath() != null ? verification.getGovtIdDocumentPath() : verification.getUser().getGovtIdUrl();
        if (docPath == null || docPath.trim().isEmpty()) {
            throw new com.skillmentor.exception.ResourceNotFoundException("Document file not found");
        }

        Path filePath = Paths.get(docPath);
        if (!Files.exists(filePath)) {
            throw new com.skillmentor.exception.ResourceNotFoundException("Document file not found on disk");
        }

        try {
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read document file: " + e.getMessage());
        }
    }
}
