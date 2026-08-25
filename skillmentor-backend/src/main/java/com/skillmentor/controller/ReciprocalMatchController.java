package com.skillmentor.controller;

import com.skillmentor.dto.ReciprocalMatchDtos.ReciprocalMatchResponseDto;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.ReciprocalMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reciprocal-matches")
@RequiredArgsConstructor
public class ReciprocalMatchController {

    private final ReciprocalMatchService reciprocalMatchService;
    private final UserRepository userRepository;

    /**
     * 1. GET /api/reciprocal-matches/suggested - Get matches suggested for the logged-in user
     */
    @GetMapping("/suggested")
    public ResponseEntity<List<ReciprocalMatchResponseDto>> getSuggestedMatches(Authentication authentication) {
        User user = getCurrentUser(authentication);
        List<ReciprocalMatchResponseDto> matches = reciprocalMatchService.getSuggestedMatches(user.getId());
        return ResponseEntity.ok(matches);
    }

    /**
     * 2. POST /api/reciprocal-matches/{id}/accept - Current user accepts the suggested match
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<ReciprocalMatchResponseDto> acceptMatch(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getCurrentUser(authentication);
        ReciprocalMatchResponseDto response = reciprocalMatchService.acceptMatch(id, user.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * 3. POST /api/reciprocal-matches/{id}/decline - Either user can decline the suggested match
     */
    @PostMapping("/{id}/decline")
    public ResponseEntity<ReciprocalMatchResponseDto> declineMatch(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getCurrentUser(authentication);
        ReciprocalMatchResponseDto response = reciprocalMatchService.declineMatch(id, user.getId());
        return ResponseEntity.ok(response);
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }
}
