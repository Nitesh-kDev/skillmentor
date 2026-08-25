package com.skillmentor.repository;

import com.skillmentor.model.PeerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PeerRequestRepository extends JpaRepository<PeerRequest, Long> {

    List<PeerRequest> findByStatus(PeerRequest.Status status);

    List<PeerRequest> findByRequesterId(Long requesterId);

    List<PeerRequest> findByCategoryAndStatus(PeerRequest.Category category, PeerRequest.Status status);

    @Query("SELECT p FROM PeerRequest p WHERE p.status = :status " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:program IS NULL OR p.program = :program) " +
           "AND (:domainSubject IS NULL OR LOWER(p.domainSubject) LIKE LOWER(CONCAT('%', :domainSubject, '%')) OR LOWER(p.skillTag) LIKE LOWER(CONCAT('%', :domainSubject, '%'))) " +
           "AND (:searchQuery IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR LOWER(p.domainSubject) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR LOWER(p.skillTag) LIKE LOWER(CONCAT('%', :searchQuery, '%'))) " +
           "ORDER BY p.createdAt DESC")
    List<PeerRequest> findFilteredRequests(
            @Param("category") PeerRequest.Category category,
            @Param("program") PeerRequest.Program program,
            @Param("domainSubject") String domainSubject,
            @Param("searchQuery") String searchQuery,
            @Param("status") PeerRequest.Status status
    );

    @Query("SELECT p FROM PeerRequest p WHERE p.status = :status " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:skillTag IS NULL OR LOWER(p.skillTag) LIKE LOWER(CONCAT('%', :skillTag, '%'))) " +
           "ORDER BY p.createdAt DESC")
    List<PeerRequest> findFilteredOpenRequests(
            @Param("category") PeerRequest.Category category,
            @Param("skillTag") String skillTag,
            @Param("status") PeerRequest.Status status
    );
}
