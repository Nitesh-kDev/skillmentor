package com.skillmentor.controller;

import com.skillmentor.dto.ReviewDtos.*;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ReviewResponse> submitReview(Authentication authentication, @RequestBody ReviewRequest request) {
        User student = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(reviewService.submitReview(student.getId(), request));
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<ReviewResponse>> getMentorReviews(@PathVariable Long mentorId) {
        return ResponseEntity.ok(reviewService.getReviewsForMentor(mentorId));
    }
}
