package com.skillmentor.service;

import com.skillmentor.dto.PeerRequestDtos.*;
import com.skillmentor.exception.BadRequestException;
import com.skillmentor.exception.InsufficientBalanceException;
import com.skillmentor.exception.ResourceNotFoundException;
import com.skillmentor.exception.UnauthorizedAccessException;
import com.skillmentor.model.*;
import com.skillmentor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PeerRequestService {

    private final PeerRequestRepository peerRequestRepository;
    private final RequestApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletService walletService;
    private final MentorshipSessionRepository sessionRepository;
    private final ReciprocalMatchService reciprocalMatchService;

    /**
     * 1. POST /api/peer-requests - Create a new student help request
     */
    @Transactional
    public PeerRequestResponseDto createPeerRequest(Long requesterId, CreatePeerRequestDto dto) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + requesterId));

        // Validate requester's current wallet balance
        Wallet wallet = walletRepository.findByUserId(requesterId)
                .orElseGet(() -> walletRepository.save(Wallet.builder().user(requester).creditBalance(50).build()));

        if (wallet.getCreditBalance() < dto.getCreditBudget()) {
            throw new InsufficientBalanceException(
                    "Insufficient wallet balance. You have " + wallet.getCreditBalance() +
                    " credits, but offered " + dto.getCreditBudget() + " credits."
            );
        }

        PeerRequest.Program requestProgram = dto.getProgram();
        if (requestProgram == null) {
            // Safe fallback mapping based on user's course if available
            String course = requester.getCourse() != null ? requester.getCourse().toUpperCase() : "";
            if (course.contains("B.TECH") || course.contains("BTECH")) requestProgram = PeerRequest.Program.BTECH;
            else if (course.contains("MCA")) requestProgram = PeerRequest.Program.MCA;
            else if (course.contains("BBA")) requestProgram = PeerRequest.Program.BBA;
            else if (course.contains("MBA")) requestProgram = PeerRequest.Program.MBA;
            else if (course.contains("LLB")) requestProgram = PeerRequest.Program.LLB;
            else requestProgram = PeerRequest.Program.OTHER;
        }

        String domainSub = (dto.getDomainSubject() != null && !dto.getDomainSubject().isBlank())
                ? dto.getDomainSubject().trim()
                : (dto.getSkillTag() != null ? dto.getSkillTag().trim() : "General");

        PeerRequest request = PeerRequest.builder()
                .requester(requester)
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .category(dto.getCategory())
                .program(requestProgram)
                .domainSubject(domainSub)
                .skillTag(dto.getSkillTag() != null ? dto.getSkillTag().trim() : domainSub)
                .creditBudget(dto.getCreditBudget())
                .status(PeerRequest.Status.OPEN)
                .build();

        request = peerRequestRepository.save(request);

        // Trigger reciprocal match check
        try {
            reciprocalMatchService.checkForReciprocalMatches(request);
        } catch (Exception e) {
            // Non-blocking exception
        }

        return mapToDto(request);
    }

    /**
     * 2. GET /api/peer-requests - Browse requests with filters
     */
    public List<PeerRequestResponseDto> getOpenRequests(
            PeerRequest.Category category,
            PeerRequest.Program program,
            String domainSubject,
            String skill,
            String searchQuery,
            PeerRequest.Status status
    ) {
        PeerRequest.Status searchStatus = status != null ? status : PeerRequest.Status.OPEN;
        String activeDomain = (domainSubject != null && !domainSubject.isBlank()) ? domainSubject.trim() : skill;
        String activeQuery = (searchQuery != null && !searchQuery.isBlank()) ? searchQuery.trim() : null;

        List<PeerRequest> requests = peerRequestRepository.findFilteredRequests(
                category, program, activeDomain, activeQuery, searchStatus
        );
        return requests.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Backward-compatible getOpenRequests overload
     */
    public List<PeerRequestResponseDto> getOpenRequests(PeerRequest.Category category, String skill, PeerRequest.Status status) {
        return getOpenRequests(category, null, null, skill, null, status);
    }

    /**
     * Get single request details by ID
     */
    public PeerRequestResponseDto getRequestById(Long requestId) {
        PeerRequest request = peerRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Student help request not found with id: " + requestId));
        return mapToDto(request);
    }

    /**
     * 3. POST /api/peer-requests/{id}/apply - A student applies to help
     */
    @Transactional
    public RequestApplicationResponseDto applyToRequest(Long requestId, Long applicantId, ApplyRequestDto dto) {
        PeerRequest request = peerRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Student help request not found with id: " + requestId));

        User applicant = userRepository.findById(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant user not found with id: " + applicantId));

        if (request.getStatus() != PeerRequest.Status.OPEN) {
            throw new BadRequestException("Applications can only be submitted to OPEN help requests");
        }

        // Business Rule: A user cannot apply to their own request
        if (request.getRequester().getId().equals(applicantId)) {
            throw new BadRequestException("You cannot apply to your own student help request");
        }

        // Business Rule: A user cannot apply twice to the same request
        if (applicationRepository.existsByPeerRequestIdAndApplicantId(requestId, applicantId)) {
            throw new BadRequestException("You have already applied to this student help request");
        }

        RequestApplication app = RequestApplication.builder()
                .peerRequest(request)
                .applicant(applicant)
                .message(dto.getMessage() != null ? dto.getMessage().trim() : "")
                .status(RequestApplication.Status.APPLIED)
                .build();

        app = applicationRepository.save(app);
        return mapApplicationToDto(app);
    }

    /**
     * 4. GET /api/peer-requests/{id}/applications - Requester views all applicants
     */
    public List<RequestApplicationResponseDto> getApplicationsForRequest(Long requestId, Long requesterId) {
        PeerRequest request = peerRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Student help request not found with id: " + requestId));

        if (!request.getRequester().getId().equals(requesterId)) {
            throw new UnauthorizedAccessException("Only the requester can view applications for this request");
        }

        List<RequestApplication> apps = applicationRepository.findByPeerRequestId(requestId);
        return apps.stream().map(this::mapApplicationToDto).collect(Collectors.toList());
    }

    /**
     * 5. POST /api/peer-requests/{id}/select/{applicationId} - Requester selects one applicant
     */
    @Transactional
    public RequestApplicationResponseDto selectApplicant(Long requestId, Long applicationId, Long requesterId) {
        PeerRequest request = peerRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Student help request not found with id: " + requestId));

        if (!request.getRequester().getId().equals(requesterId)) {
            throw new UnauthorizedAccessException("Only the requester can select an applicant");
        }

        if (request.getStatus() != PeerRequest.Status.OPEN) {
            throw new BadRequestException("Applicants can only be selected for OPEN requests");
        }

        RequestApplication selectedApp = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (!selectedApp.getPeerRequest().getId().equals(requestId)) {
            throw new BadRequestException("Application does not belong to this request");
        }

        // Set selected application to SELECTED
        selectedApp.setStatus(RequestApplication.Status.SELECTED);
        applicationRepository.save(selectedApp);

        // Reject all other applications for this request
        List<RequestApplication> allApps = applicationRepository.findByPeerRequestId(requestId);
        for (RequestApplication app : allApps) {
            if (!app.getId().equals(applicationId)) {
                app.setStatus(RequestApplication.Status.REJECTED);
                applicationRepository.save(app);
            }
        }

        // Set PeerRequest status to IN_PROGRESS
        request.setStatus(PeerRequest.Status.IN_PROGRESS);
        peerRequestRepository.save(request);

        // Create official MentorshipSession record for My Sessions & Chat live room access
        MentorshipSession session = MentorshipSession.builder()
                .student(request.getRequester())
                .mentor(selectedApp.getApplicant())
                .title("Student Help: " + request.getTitle())
                .topicSkill(request.getDomainSubject() != null ? request.getDomainSubject() : (request.getSkillTag() != null ? request.getSkillTag() : "Student Help"))
                .scheduledTime(java.time.LocalDateTime.now())
                .durationMinutes(60)
                .sessionType(MentorshipSession.SessionType.PEER_CREDIT)
                .creditCost(request.getCreditBudget())
                .priceInINR(0.0)
                .status(MentorshipSession.SessionStatus.ACCEPTED)
                .build();
        sessionRepository.save(session);

        return mapApplicationToDto(selectedApp);
    }

    /**
     * 6. POST /api/peer-requests/{id}/complete - Requester marks request COMPLETED -> triggers credit transfer
     */
    @Transactional
    public PeerRequestResponseDto completeRequest(Long requestId, Long requesterId) {
        PeerRequest request = peerRequestRepository.findByIdForUpdate(requestId)
                .orElseGet(() -> peerRequestRepository.findById(requestId)
                        .orElseThrow(() -> new ResourceNotFoundException("Student help request not found with id: " + requestId)));

        if (!request.getRequester().getId().equals(requesterId)) {
            throw new UnauthorizedAccessException("Only the requester can mark this request as COMPLETED");
        }

        // Idempotent: If already COMPLETED, do not execute credit transfer again
        if (request.getStatus() == PeerRequest.Status.COMPLETED) {
            return mapToDto(request);
        }

        if (request.getStatus() == PeerRequest.Status.CANCELLED) {
            throw new BadRequestException("Cancelled requests cannot be marked COMPLETED");
        }

        if (request.getStatus() != PeerRequest.Status.IN_PROGRESS && request.getStatus() != PeerRequest.Status.OPEN) {
            throw new BadRequestException("Only IN_PROGRESS or OPEN requests can be marked COMPLETED");
        }

        RequestApplication selectedApp = applicationRepository.findByPeerRequestIdAndStatus(requestId, RequestApplication.Status.SELECTED)
                .orElse(null);

        if (selectedApp == null && request.getStatus() == PeerRequest.Status.IN_PROGRESS) {
            throw new BadRequestException("No applicant selected for this in-progress request");
        }

        // Execute Credit Transfer if applicant selected and credits not already settled
        if (selectedApp != null) {
            User requester = request.getRequester();
            User helper = selectedApp.getApplicant();
            int budget = request.getCreditBudget() != null ? request.getCreditBudget() : 0;

            // Check if credit has already been settled on associated session
            List<MentorshipSession> sessions = sessionRepository.findByStudentOrMentor(requester, requester);
            boolean alreadySettled = false;
            for (MentorshipSession s : sessions) {
                if (s.getMentor().getId().equals(helper.getId()) &&
                        (s.getTitle() != null && s.getTitle().contains(request.getTitle())) &&
                        Boolean.TRUE.equals(s.getCreditSettled())) {
                    alreadySettled = true;
                    break;
                }
            }

            // Transfer credits exactly once
            if (!alreadySettled && budget > 0) {
                walletService.transferCredits(
                        requester.getId(),
                        helper.getId(),
                        budget,
                        "Completed Student Help Request: " + request.getTitle()
                );
            }

            // Also update associated MentorshipSession status to COMPLETED and creditSettled to true
            for (MentorshipSession s : sessions) {
                if (s.getMentor().getId().equals(helper.getId()) &&
                        (s.getTitle() != null && s.getTitle().contains(request.getTitle()))) {
                    s.setStatus(MentorshipSession.SessionStatus.COMPLETED);
                    s.setCreditSettled(true);
                    sessionRepository.save(s);
                }
            }
        }

        request.setStatus(PeerRequest.Status.COMPLETED);
        request = peerRequestRepository.save(request);

        return mapToDto(request);
    }

    /**
     * 7. POST /api/peer-requests/{id}/cancel - Requester cancels if status is OPEN
     */
    @Transactional
    public PeerRequestResponseDto cancelRequest(Long requestId, Long requesterId) {
        PeerRequest request = peerRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Student help request not found with id: " + requestId));

        if (!request.getRequester().getId().equals(requesterId)) {
            throw new UnauthorizedAccessException("Only the requester can cancel this request");
        }

        if (request.getStatus() != PeerRequest.Status.OPEN) {
            throw new BadRequestException("Only OPEN requests can be cancelled");
        }

        request.setStatus(PeerRequest.Status.CANCELLED);
        request = peerRequestRepository.save(request);

        return mapToDto(request);
    }

    private PeerRequestResponseDto mapToDto(PeerRequest req) {
        int appCount = applicationRepository.findByPeerRequestId(req.getId()).size();
        return PeerRequestResponseDto.builder()
                .id(req.getId())
                .requesterId(req.getRequester().getId())
                .requesterName(req.getRequester().getName())
                .requesterCollege(req.getRequester().getCollegeName())
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .program(req.getProgram() != null ? req.getProgram() : PeerRequest.Program.OTHER)
                .domainSubject(req.getDomainSubject() != null ? req.getDomainSubject() : req.getSkillTag())
                .skillTag(req.getSkillTag())
                .creditBudget(req.getCreditBudget())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .applicationCount(appCount)
                .build();
    }

    private RequestApplicationResponseDto mapApplicationToDto(RequestApplication app) {
        return RequestApplicationResponseDto.builder()
                .id(app.getId())
                .requestId(app.getPeerRequest().getId())
                .requestTitle(app.getPeerRequest().getTitle())
                .applicantId(app.getApplicant().getId())
                .applicantName(app.getApplicant().getName())
                .applicantCollege(app.getApplicant().getCollegeName())
                .message(app.getMessage())
                .status(app.getStatus())
                .createdAt(app.getCreatedAt())
                .build();
    }
}
