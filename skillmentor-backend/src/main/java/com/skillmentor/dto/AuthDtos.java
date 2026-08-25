package com.skillmentor.dto;

import com.skillmentor.model.User;
import com.skillmentor.model.UserSkill;
import lombok.*;
import java.util.List;

public class AuthDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private User.Role role;
        private String collegeEmail;
        private String linkedinUrl;
        private String collegeName;
        private String course;
        private String currentYear;
        private Integer passingYear;
        private String currentCompany;
        private String currentDesignation;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private String refreshToken;
        private Long userId;
        private String name;
        private String email;
        private User.Role role;
        private User.VerificationStatus verificationStatus;
        private String collegeName;
        private String course;
        private String currentYear;
        private Integer passingYear;
        private String currentCompany;
        private String currentDesignation;
        private String linkedinUrl;
        private Integer walletBalance;
        private Double averageRating;
        private Double hourlyRate;
        private User.AlumniBenefitType alumniBenefitType;
        private Integer alumniDiscountPercent;
        private String availableSlots;
        private String bio;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OtpVerifyRequest {
        private String email;
        private String otpCode;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SkillDto {
        private Long id;
        private String skillName;
        private UserSkill.SkillType type;
        private UserSkill.ProficiencyLevel proficiency;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserProfileDto {
        private Long id;
        private String name;
        private String email;
        private User.Role role;
        private User.VerificationStatus verificationStatus;
        private String collegeEmail;
        private String linkedinUrl;
        private String govtIdUrl;
        private String govtIdType;
        private String govtIdNumber;
        private String collegeName;
        private String course;
        private String currentYear;
        private Integer passingYear;
        private String currentCompany;
        private String currentDesignation;
        private String bio;
        private Double hourlyRate;
        private User.AlumniBenefitType alumniBenefitType;
        private Integer alumniDiscountPercent;
        private String availableSlots;
        private Double averageRating;
        private Integer totalReviews;
        private Integer walletBalance;
        private List<SkillDto> skills;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateProfileRequest {
        private Double hourlyRate;
        private User.AlumniBenefitType alumniBenefitType;
        private Integer alumniDiscountPercent;
        private String availableSlots;
        private String bio;
        private String collegeName;
        private String currentCompany;
        private String currentDesignation;
        private String course;
        private String currentYear;
        private Integer passingYear;
        private String linkedinUrl;
        private String govtIdUrl;
        private String govtIdType;
        private String govtIdNumber;
    }
}
