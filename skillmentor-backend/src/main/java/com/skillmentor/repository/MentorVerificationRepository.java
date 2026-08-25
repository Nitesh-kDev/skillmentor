package com.skillmentor.repository;

import com.skillmentor.model.MentorVerification;
import com.skillmentor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorVerificationRepository extends JpaRepository<MentorVerification, Long> {
    Optional<MentorVerification> findByUser(User user);
    Optional<MentorVerification> findByUserId(Long userId);
    List<MentorVerification> findByStage(MentorVerification.VerificationStage stage);
}
