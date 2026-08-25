package com.skillmentor.repository;

import com.skillmentor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(User.Role role);
    
    List<User> findByVerificationStatus(User.VerificationStatus status);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN UserSkill s ON s.user = u " +
           "WHERE (u.role = 'MENTOR' OR u.role = 'ALUMNI') " +
           "AND (:skill IS NULL OR :skill = '' OR LOWER(s.skillName) LIKE LOWER(CONCAT('%', :skill, '%'))) " +
           "AND (:college IS NULL OR :college = '' OR LOWER(u.collegeName) LIKE LOWER(CONCAT('%', :college, '%'))) " +
           "ORDER BY u.averageRating DESC")
    List<User> findMentorsBySkillAndCollegeSortedByRating(@Param("skill") String skill, @Param("college") String college);

    @Query("SELECT DISTINCT u FROM User u " +
           "WHERE (u.role = 'MENTOR' OR u.role = 'ALUMNI') " +
           "AND (:college IS NULL OR :college = '' OR LOWER(u.collegeName) LIKE LOWER(CONCAT('%', :college, '%'))) " +
           "ORDER BY u.averageRating DESC")
    List<User> findAllMentorsByCollegeSortedByRating(@Param("college") String college);
}
