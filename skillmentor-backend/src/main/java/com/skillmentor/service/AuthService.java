package com.skillmentor.service;

import com.skillmentor.dto.AuthDtos.*;
import com.skillmentor.model.User;
import com.skillmentor.model.UserSkill;
import com.skillmentor.model.Wallet;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.repository.UserSkillRepository;
import com.skillmentor.repository.WalletRepository;
import com.skillmentor.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        // Security: Prevent self-assignment of ADMIN role via public registration
        if (request.getRole() == User.Role.ADMIN) {
            throw new com.skillmentor.exception.BadRequestException("Self-registration as ADMIN is not allowed.");
        }

        // Strict Validation: Students MUST register with a valid college email ending in .ac.in or .edu
        if (request.getRole() == User.Role.STUDENT) {
            String checkEmail = request.getCollegeEmail() != null && !request.getCollegeEmail().trim().isEmpty()
                    ? request.getCollegeEmail().trim() : request.getEmail().trim();
            String lowerEmail = checkEmail.toLowerCase();
            if (!lowerEmail.endsWith(".ac.in") && !lowerEmail.endsWith(".edu")) {
                throw new com.skillmentor.exception.BadRequestException("Students must register with a valid college email address ending in .ac.in or .edu (e.g. student@college.ac.in)!");
            }
        }

        User.VerificationStatus initialStatus = User.VerificationStatus.UNVERIFIED;
        if (request.getRole() == User.Role.STUDENT) {
            initialStatus = User.VerificationStatus.VERIFIED;
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : User.Role.STUDENT)
                .verificationStatus(initialStatus)
                .collegeEmail(request.getCollegeEmail() != null ? request.getCollegeEmail() : request.getEmail())
                .linkedinUrl(request.getLinkedinUrl())
                .collegeName(request.getCollegeName() != null ? request.getCollegeName() : "JSS Academy of Technical Education")
                .course(request.getCourse() != null ? request.getCourse() : "B.Tech Computer Science")
                .currentYear(request.getCurrentYear() != null ? request.getCurrentYear() : "3rd Year")
                .passingYear(request.getPassingYear() != null ? request.getPassingYear() : 2027)
                .currentCompany(request.getCurrentCompany())
                .currentDesignation(request.getCurrentDesignation())
                .hourlyRate(800.0)
                .alumniBenefitType(User.AlumniBenefitType.NONE)
                .alumniDiscountPercent(0)
                .availableSlots("Mon, Wed, Fri (6:00 PM - 9:00 PM)")
                .bio("Excited to share and learn new skills on SkillSwap Campus!")
                .build();

        user = userRepository.save(user);

        Wallet wallet = Wallet.builder()
                .user(user)
                .creditBalance(50)
                .build();
        walletRepository.save(wallet);

        String token = jwtTokenProvider.generateTokenForUser(user.getEmail());

        return buildAuthResponse(user, token, wallet.getCreditBalance());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (Boolean.TRUE.equals(user.getIsSuspended())) {
            throw new RuntimeException("Your account has been suspended by system administrator. Please contact support.");
        }

        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> walletRepository.save(Wallet.builder().user(user).creditBalance(50).build()));

        String token = jwtTokenProvider.generateTokenForUser(user.getEmail());

        return buildAuthResponse(user, token, wallet.getCreditBalance());
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getHourlyRate() != null) user.setHourlyRate(request.getHourlyRate());
        if (user.getRole() == User.Role.ALUMNI || user.getRole() == User.Role.MENTOR) {
            if (request.getAlumniBenefitType() != null) user.setAlumniBenefitType(request.getAlumniBenefitType());
            if (request.getAlumniDiscountPercent() != null) {
                int disc = request.getAlumniDiscountPercent();
                if (disc < 0) disc = 0;
                if (disc > 100) disc = 100;
                user.setAlumniDiscountPercent(disc);
            }
        }
        if (request.getAvailableSlots() != null) user.setAvailableSlots(request.getAvailableSlots());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getCollegeName() != null) user.setCollegeName(request.getCollegeName());
        if (request.getCurrentCompany() != null) user.setCurrentCompany(request.getCurrentCompany());
        if (request.getCurrentDesignation() != null) user.setCurrentDesignation(request.getCurrentDesignation());
        if (request.getCourse() != null) user.setCourse(request.getCourse());
        if (request.getCurrentYear() != null) user.setCurrentYear(request.getCurrentYear());
        if (request.getPassingYear() != null) user.setPassingYear(request.getPassingYear());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGovtIdType() != null) user.setGovtIdType(request.getGovtIdType());
        if (request.getGovtIdNumber() != null) user.setGovtIdNumber(request.getGovtIdNumber());
        if (request.getGovtIdUrl() != null) user.setGovtIdUrl(request.getGovtIdUrl());

        // When mentor/alumni submits a govt ID document for verification, set status to PENDING
        if (request.getGovtIdNumber() != null && !request.getGovtIdNumber().trim().isEmpty()) {
            if (user.getVerificationStatus() != User.VerificationStatus.VERIFIED) {
                user.setVerificationStatus(User.VerificationStatus.PENDING);
            }
        }

        user = userRepository.save(user);
        return getUserProfile(user.getId());
    }

    @Transactional
    public String generateCollegeOtp(String email, String collegeEmail) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
        user.setCollegeEmail(collegeEmail);
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        System.out.println("==================================================");
        System.out.println("COLLEGE EMAIL OTP SENT TO: " + collegeEmail);
        System.out.println("OTP CODE: " + otp);
        System.out.println("==================================================");

        return "OTP sent successfully to " + collegeEmail + ". (Demo OTP: " + otp + ")";
    }

    @Transactional
    public boolean verifyCollegeOtp(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtpCode() != null && user.getOtpCode().equals(otpCode) &&
                user.getOtpExpiry() != null && user.getOtpExpiry().isAfter(LocalDateTime.now())) {
            user.setVerificationStatus(User.VerificationStatus.VERIFIED);
            user.setOtpCode(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public UserProfileDto getUserProfile(Long userId) {
        return getUserProfile(userId, userId, true);
    }

    public UserProfileDto getUserProfile(Long userId, Long requestingUserId, boolean isAdmin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.skillmentor.exception.ResourceNotFoundException("User not found with ID: " + userId));

        boolean isSelf = requestingUserId != null && requestingUserId.equals(userId);
        boolean canSeePrivateFields = isSelf || isAdmin;

        Wallet wallet = canSeePrivateFields ? walletRepository.findByUser(user).orElse(null) : null;
        List<UserSkill> skills = userSkillRepository.findByUser(user);

        List<SkillDto> skillDtos = skills.stream().map(s -> SkillDto.builder()
                .id(s.getId())
                .skillName(s.getSkillName())
                .type(s.getType())
                .proficiency(s.getProficiency())
                .build()).collect(Collectors.toList());

        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(canSeePrivateFields ? user.getEmail() : null)
                .role(user.getRole())
                .verificationStatus(user.getVerificationStatus())
                .collegeEmail(canSeePrivateFields ? user.getCollegeEmail() : null)
                .linkedinUrl(user.getLinkedinUrl())
                .govtIdUrl(canSeePrivateFields ? user.getGovtIdUrl() : null)
                .govtIdType(canSeePrivateFields ? user.getGovtIdType() : null)
                .govtIdNumber(canSeePrivateFields ? user.getGovtIdNumber() : null)
                .collegeName(user.getCollegeName())
                .course(user.getCourse())
                .currentYear(user.getCurrentYear())
                .passingYear(user.getPassingYear())
                .currentCompany(user.getCurrentCompany())
                .currentDesignation(user.getCurrentDesignation())
                .bio(user.getBio())
                .hourlyRate(user.getHourlyRate())
                .alumniBenefitType(user.getAlumniBenefitType())
                .alumniDiscountPercent(user.getAlumniDiscountPercent())
                .availableSlots(user.getAvailableSlots())
                .averageRating(user.getAverageRating())
                .totalReviews(user.getTotalReviews())
                .walletBalance(wallet != null ? wallet.getCreditBalance() : null)
                .skills(skillDtos)
                .build();
    }

    @Transactional
    public SkillDto addSkill(Long userId, SkillDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserSkill skill = UserSkill.builder()
                .user(user)
                .skillName(dto.getSkillName())
                .type(dto.getType() != null ? dto.getType() : UserSkill.SkillType.OFFERED)
                .proficiency(dto.getProficiency() != null ? dto.getProficiency() : UserSkill.ProficiencyLevel.INTERMEDIATE)
                .build();

        skill = userSkillRepository.save(skill);

        return SkillDto.builder()
                .id(skill.getId())
                .skillName(skill.getSkillName())
                .type(skill.getType())
                .proficiency(skill.getProficiency())
                .build();
    }

    @Transactional
    public boolean deleteSkill(Long userId, Long skillId) {
        UserSkill skill = userSkillRepository.findById(skillId)
                .orElseThrow(() -> new com.skillmentor.exception.ResourceNotFoundException("Skill not found with ID: " + skillId));

        if (!skill.getUser().getId().equals(userId)) {
            throw new com.skillmentor.exception.UnauthorizedAccessException("You are not authorized to delete this skill!");
        }

        userSkillRepository.delete(skill);
        return true;
    }

    @Transactional
    public boolean deleteSkillByName(Long userId, String skillName) {
        try {
            System.out.println("DELETING SKILL BY NAME VIA JPQL -> Skill Name: " + skillName + ", User ID: " + userId);
            userSkillRepository.deleteSkillByNameJPQL(userId, skillName);
            return true;
        } catch (Exception e) {
            System.err.println("JPQL skill name deletion error: " + e.getMessage());
            return false;
        }
    }

    private AuthResponse buildAuthResponse(User user, String token, Integer walletBalance) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .verificationStatus(user.getVerificationStatus())
                .collegeName(user.getCollegeName())
                .course(user.getCourse())
                .currentYear(user.getCurrentYear())
                .passingYear(user.getPassingYear())
                .currentCompany(user.getCurrentCompany())
                .currentDesignation(user.getCurrentDesignation())
                .linkedinUrl(user.getLinkedinUrl())
                .walletBalance(walletBalance)
                .averageRating(user.getAverageRating())
                .hourlyRate(user.getHourlyRate())
                .alumniBenefitType(user.getAlumniBenefitType())
                .alumniDiscountPercent(user.getAlumniDiscountPercent())
                .availableSlots(user.getAvailableSlots())
                .bio(user.getBio())
                .build();
    }
}
