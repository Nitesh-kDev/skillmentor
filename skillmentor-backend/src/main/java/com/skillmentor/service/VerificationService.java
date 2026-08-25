package com.skillmentor.service;

import com.skillmentor.dto.AdminDtos.MentorVerificationDto;
import com.skillmentor.model.MentorVerification;
import com.skillmentor.model.User;
import com.skillmentor.repository.MentorVerificationRepository;
import com.skillmentor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final MentorVerificationRepository verificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public MentorVerification submitMentorVerification(Long userId, String linkedinUrl, String company, String designation, Integer experience, String govtIdDocumentPath) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MentorVerification verification = verificationRepository.findByUser(user)
                .orElse(MentorVerification.builder().user(user).build());

        verification.setLinkedinUrl(linkedinUrl);
        verification.setCompany(company);
        verification.setDesignation(designation);
        verification.setExperienceYears(experience);
        verification.setGovtIdDocumentPath(govtIdDocumentPath);
        verification.setStage(MentorVerification.VerificationStage.PENDING);

        user.setVerificationStatus(User.VerificationStatus.PENDING);
        user.setLinkedinUrl(linkedinUrl);
        user.setGovtIdUrl(govtIdDocumentPath);
        userRepository.save(user);

        return verificationRepository.save(verification);
    }

    @Transactional
    public MentorVerificationDto processVerificationApproval(Long verificationId, boolean approve, String notes) {
        MentorVerification verification = verificationRepository.findById(verificationId).orElse(null);
        User user = null;
        if (verification != null) {
            user = verification.getUser();
            if (approve) {
                verification.setStage(MentorVerification.VerificationStage.APPROVED);
                if (user != null) user.setVerificationStatus(User.VerificationStatus.VERIFIED);
            } else {
                verification.setStage(MentorVerification.VerificationStage.REJECTED);
                if (user != null) user.setVerificationStatus(User.VerificationStatus.REJECTED);
            }
            verification.setReviewerNotes(notes);
            verificationRepository.save(verification);
        } else {
            user = userRepository.findById(verificationId).orElse(null);
            if (user != null) {
                user.setVerificationStatus(approve ? User.VerificationStatus.VERIFIED : User.VerificationStatus.REJECTED);
            }
        }

        if (user != null) {
            userRepository.save(user);
        }

        return MentorVerificationDto.builder()
                .id(verification != null ? verification.getId() : (user != null ? user.getId() : verificationId))
                .userId(user != null ? user.getId() : verificationId)
                .userName(user != null ? user.getName() : "Mentor User")
                .userEmail(user != null ? user.getEmail() : "")
                .company(user != null ? user.getCurrentCompany() : "")
                .designation(user != null ? user.getCurrentDesignation() : "")
                .experienceYears(verification != null ? verification.getExperienceYears() : 3)
                .linkedinUrl(user != null ? user.getLinkedinUrl() : "")
                .govtIdDocumentPath(user != null ? user.getGovtIdUrl() : "")
                .stage(user != null ? user.getVerificationStatus().name() : (approve ? "VERIFIED" : "REJECTED"))
                .build();
    }

    public List<MentorVerificationDto> getPendingVerifications() {
        List<User> pendingUsers = userRepository.findByVerificationStatus(User.VerificationStatus.PENDING);
        List<MentorVerificationDto> dtos = new ArrayList<>();

        for (User u : pendingUsers) {
            MentorVerification mv = verificationRepository.findByUser(u).orElse(null);
            String docInfo = u.getGovtIdUrl() != null && !u.getGovtIdUrl().trim().isEmpty() 
                    ? u.getGovtIdUrl() 
                    : (u.getGovtIdNumber() != null ? u.getGovtIdType() + ": " + u.getGovtIdNumber() : (mv != null ? mv.getGovtIdDocumentPath() : "Govt ID Document"));

            dtos.add(MentorVerificationDto.builder()
                    .id(mv != null ? mv.getId() : u.getId())
                    .userId(u.getId())
                    .userName(u.getName())
                    .userEmail(u.getEmail())
                    .company(u.getCurrentCompany() != null ? u.getCurrentCompany() : (mv != null ? mv.getCompany() : "Pending Mentor"))
                    .designation(u.getCurrentDesignation() != null ? u.getCurrentDesignation() : (mv != null ? mv.getDesignation() : "Engineer"))
                    .experienceYears(mv != null ? mv.getExperienceYears() : 3)
                    .linkedinUrl(u.getLinkedinUrl() != null ? u.getLinkedinUrl() : (mv != null ? mv.getLinkedinUrl() : ""))
                    .govtIdDocumentPath(docInfo)
                    .stage(u.getVerificationStatus().name())
                    .build());
        }

        return dtos;
    }

    public MentorVerification getVerificationById(Long verificationId) {
        return verificationRepository.findById(verificationId)
                .orElseThrow(() -> new com.skillmentor.exception.ResourceNotFoundException("Verification not found with ID: " + verificationId));
    }
}
