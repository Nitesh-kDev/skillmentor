package com.skillmentor.controller;

import com.skillmentor.dto.AuthDtos.*;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/otp/send")
    public ResponseEntity<String> sendOtp(@RequestParam String email, @RequestParam String collegeEmail) {
        return ResponseEntity.ok(authService.generateCollegeOtp(email, collegeEmail));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<Boolean> verifyOtp(@RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyCollegeOtp(request.getEmail(), request.getOtpCode()));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication, @PathVariable Long userId) {
        User requester = (authentication != null && authentication.isAuthenticated())
                ? userRepository.findByEmail(authentication.getName()).orElse(null) : null;
        Long requestingUserId = requester != null ? requester.getId() : null;
        boolean isAdmin = requester != null && requester.getRole() == User.Role.ADMIN;
        return ResponseEntity.ok(authService.getUserProfile(userId, requestingUserId, isAdmin));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(authService.getUserProfile(user.getId()));
    }

    @PostMapping("/skills")
    public ResponseEntity<SkillDto> addSkill(Authentication authentication, @RequestBody SkillDto skillDto) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(authService.addSkill(user.getId(), skillDto));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<Boolean> deleteSkill(Authentication authentication, @PathVariable Long skillId) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(authService.deleteSkill(user.getId(), skillId));
    }

    @DeleteMapping("/skills/name/{skillName}")
    public ResponseEntity<Boolean> deleteSkillByName(Authentication authentication, @PathVariable String skillName) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(authService.deleteSkillByName(user.getId(), skillName));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(Authentication authentication, @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(authService.updateProfile(user.getId(), request));
    }
}
