package com.skillmentor.repository;

import com.skillmentor.model.Review;
import com.skillmentor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMentor(User mentor);
    List<Review> findByMentorId(Long mentorId);
    Optional<Review> findBySessionId(Long sessionId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.mentor.id = :mentorId")
    Double calculateAverageRatingForMentor(@Param("mentorId") Long mentorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.mentor.id = :mentorId")
    Integer countReviewsForMentor(@Param("mentorId") Long mentorId);
}
