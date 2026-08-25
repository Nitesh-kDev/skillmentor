package com.skillmentor.repository;

import com.skillmentor.model.ReciprocalMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReciprocalMatchRepository extends JpaRepository<ReciprocalMatch, Long> {

    @Query("SELECT r FROM ReciprocalMatch r WHERE (r.userA.id = :userId OR r.userB.id = :userId) AND r.status != 'DECLINED'")
    List<ReciprocalMatch> findSuggestedOrActiveMatchesForUser(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM ReciprocalMatch r WHERE " +
           "(r.requestA.id = :reqAId AND r.requestB.id = :reqBId) OR (r.requestA.id = :reqBId AND r.requestB.id = :reqAId)")
    boolean existsMatchBetweenRequests(@Param("reqAId") Long reqAId, @Param("reqBId") Long reqBId);
}
