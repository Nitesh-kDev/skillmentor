package com.skillmentor.controller;

import com.skillmentor.dto.SessionDtos.*;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(Authentication authentication, @RequestBody BookingRequest request) {
        User student = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(bookingService.createBooking(student.getId(), request));
    }

    @PatchMapping("/{sessionId}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            Authentication authentication,
            @PathVariable Long sessionId,
            @RequestBody SessionStatusUpdate update) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(bookingService.updateSessionStatus(sessionId, user.getId(), update.getStatus()));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getMySessions(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(bookingService.getUserSessions(user.getId()));
    }

    @GetMapping("/mentor-summary")
    public ResponseEntity<MentorSummaryDto> getMentorSummary(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(bookingService.getMentorSummary(user.getId()));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<BookingResponse> getSessionById(Authentication authentication, @PathVariable Long sessionId) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new com.skillmentor.exception.ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(bookingService.getSessionById(sessionId, user.getId()));
    }
}
