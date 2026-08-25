package com.skillmentor.repository;

import com.skillmentor.model.RequestApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequestApplicationRepository extends JpaRepository<RequestApplication, Long> {

    List<RequestApplication> findByPeerRequestId(Long requestId);

    List<RequestApplication> findByApplicantId(Long applicantId);

    boolean existsByPeerRequestIdAndApplicantId(Long requestId, Long applicantId);

    Optional<RequestApplication> findByPeerRequestIdAndApplicantId(Long requestId, Long applicantId);

    Optional<RequestApplication> findByPeerRequestIdAndStatus(Long requestId, RequestApplication.Status status);
}
