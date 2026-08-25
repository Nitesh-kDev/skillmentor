package com.skillmentor.service;

import com.skillmentor.dto.ReviewDtos.*;
import com.skillmentor.model.*;
import com.skillmentor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MentorshipSessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse submitReview(Long studentId, ReviewRequest request) {
        if (request == null || request.getSessionId() == null) {
            throw new com.skillmentor.exception.BadRequestException("Session ID is required to submit a review.");
        }

        MentorshipSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new com.skillmentor.exception.ResourceNotFoundException("Session not found with ID: " + request.getSessionId()));

        User mentor = session.getMentor();
        User student = session.getStudent();

        // 1. Authenticated user must be the student who booked the session
        if (!student.getId().equals(studentId)) {
            throw new com.skillmentor.exception.UnauthorizedAccessException("Only the student who participated in this session can leave a review.");
        }

        // 2. User cannot rate themselves
        if (student.getId().equals(mentor.getId())) {
            throw new com.skillmentor.exception.BadRequestException("You cannot rate yourself!");
        }

        // 3. Provider MUST be a Mentor or Alumni (Students CANNOT receive ratings)
        if (mentor.getRole() != User.Role.MENTOR && mentor.getRole() != User.Role.ALUMNI) {
            throw new com.skillmentor.exception.BadRequestException("Ratings are only allowed for Mentor or Alumni providers. Peer student sessions cannot be rated.");
        }

        // 4. Session status MUST be COMPLETED
        if (session.getStatus() != MentorshipSession.SessionStatus.COMPLETED) {
            throw new com.skillmentor.exception.BadRequestException("Reviews can only be submitted for COMPLETED mentorship sessions.");
        }

        // 5. Rating range check (1 to 5)
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new com.skillmentor.exception.BadRequestException("Rating must be between 1 and 5 stars.");
        }

        // 6. Duplicate review check: a student cannot review the same completed session twice
        if (reviewRepository.findBySessionId(session.getId()).isPresent()) {
            throw new com.skillmentor.exception.BadRequestException("You have already submitted a review for this mentorship session.");
        }

        Review review = Review.builder()
                .session(session)
                .mentor(mentor)
                .student(student)
                .rating(request.getRating())
                .feedback(request.getFeedback() != null ? request.getFeedback().trim() : "")
                .build();

        review = reviewRepository.save(review);

        // Recalculate and update cached average rating and review count on mentor/alumni profile
        Double avgRating = reviewRepository.calculateAverageRatingForMentor(mentor.getId());
        Integer totalReviews = reviewRepository.countReviewsForMentor(mentor.getId());

        mentor.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        mentor.setTotalReviews(totalReviews != null ? totalReviews : 0);
        userRepository.save(mentor);

        return ReviewResponse.builder()
                .id(review.getId())
                .sessionId(session.getId())
                .mentorId(mentor.getId())
                .mentorName(mentor.getName())
                .studentId(student.getId())
                .studentName(student.getName())
                .rating(review.getRating())
                .feedback(review.getFeedback())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public List<ReviewResponse> getReviewsForMentor(Long mentorId) {
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        List<Review> reviews = reviewRepository.findByMentor(mentor);

        return reviews.stream().map(r -> ReviewResponse.builder()
                .id(r.getId())
                .sessionId(r.getSession().getId())
                .mentorId(r.getMentor().getId())
                .mentorName(r.getMentor().getName())
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getName())
                .rating(r.getRating())
                .feedback(r.getFeedback())
                .createdAt(r.getCreatedAt())
                .build()).collect(Collectors.toList());
    }
}
