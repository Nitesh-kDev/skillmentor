package com.skillmentor.repository;

import com.skillmentor.model.MentorshipSession;
import com.skillmentor.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MentorshipSessionRepository extends JpaRepository<MentorshipSession, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM MentorshipSession s WHERE s.id = :id")
    Optional<MentorshipSession> findByIdForUpdate(@Param("id") Long id);
    List<MentorshipSession> findByStudent(User student);
    List<MentorshipSession> findByMentor(User mentor);
    List<MentorshipSession> findByStudentOrMentor(User student, User mentor);

    @Query("SELECT s FROM MentorshipSession s WHERE s.mentor.id = :mentorId " +
           "AND s.status IN ('PENDING', 'ACCEPTED') " +
           "AND s.scheduledTime = :scheduledTime")
    List<MentorshipSession> findConflictingSessions(@Param("mentorId") Long mentorId,
                                                    @Param("scheduledTime") LocalDateTime scheduledTime);
}
