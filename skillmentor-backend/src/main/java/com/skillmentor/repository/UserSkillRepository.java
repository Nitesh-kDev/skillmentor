package com.skillmentor.repository;

import com.skillmentor.model.User;
import com.skillmentor.model.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    
    List<UserSkill> findByUser(User user);
    
    List<UserSkill> findByUserId(Long userId);
    
    List<UserSkill> findByType(UserSkill.SkillType type);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM UserSkill s WHERE s.id = :skillId")
    void deleteSkillByIdJPQL(@Param("skillId") Long skillId);

    @Modifying
    @Transactional
    @Query("DELETE FROM UserSkill s WHERE s.user.id = :userId AND LOWER(s.skillName) = LOWER(:skillName)")
    void deleteSkillByNameJPQL(@Param("userId") Long userId, @Param("skillName") String skillName);
}
