package com.skillmentor.controller;

import com.skillmentor.dto.PeerRequestDtos.*;
import com.skillmentor.model.PeerRequest;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.PeerRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/peer-requests")
@RequiredArgsConstructor
public class PeerRequestController {

    private final PeerRequestService peerRequestService;
    private final UserRepository userRepository;

    /**
     * 1. POST /api/peer-requests - Create a new peer help request (requester_id from JWT)
     */
    @PostMapping
    public ResponseEntity<PeerRequestResponseDto> createPeerRequest(
            Authentication authentication,
            @Valid @RequestBody CreatePeerRequestDto dto) {
        User user = getCurrentUser(authentication);
        PeerRequestResponseDto response = peerRequestService.createPeerRequest(user.getId(), dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * 2. GET /api/peer-requests?category=&skill=&status=OPEN - Browse open requests
     */
    @GetMapping
    public ResponseEntity<List<PeerRequestResponseDto>> getOpenRequests(
            @RequestParam(required = false) PeerRequest.Category category,
            @RequestParam(required = false) PeerRequest.Program program,
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) PeerRequest.Status status) {
        List<PeerRequestResponseDto> requests = peerRequestService.getOpenRequests(category, program, domain, skill, query, status);
        return ResponseEntity.ok(requests);
    }

    /**
     * GET /api/peer-requests/{id} - Get single request details
     */
    @GetMapping("/{id}")
    public ResponseEntity<PeerRequestResponseDto> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(peerRequestService.getRequestById(id));
    }

    /**
     * 3. POST /api/peer-requests/{id}/apply - A student applies to help
     */
    @PostMapping("/{id}/apply")
    public ResponseEntity<RequestApplicationResponseDto> applyToRequest(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ApplyRequestDto dto) {
        User user = getCurrentUser(authentication);
        RequestApplicationResponseDto response = peerRequestService.applyToRequest(id, user.getId(), dto);
        return ResponseEntity.ok(response);
    }

    /**
     * 4. GET /api/peer-requests/{id}/applications - Requester views all applicants
     */
    @GetMapping("/{id}/applications")
    public ResponseEntity<List<RequestApplicationResponseDto>> getApplications(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getCurrentUser(authentication);
        List<RequestApplicationResponseDto> applications = peerRequestService.getApplicationsForRequest(id, user.getId());
        return ResponseEntity.ok(applications);
    }

    /**
     * 5. POST /api/peer-requests/{id}/select/{applicationId} - Requester selects one applicant
     */
    @PostMapping("/{id}/select/{applicationId}")
    public ResponseEntity<RequestApplicationResponseDto> selectApplicant(
            Authentication authentication,
            @PathVariable Long id,
            @PathVariable Long applicationId) {
        User user = getCurrentUser(authentication);
        RequestApplicationResponseDto response = peerRequestService.selectApplicant(id, applicationId, user.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * 6. POST /api/peer-requests/{id}/complete - Requester marks request COMPLETED (triggers credit transfer)
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<PeerRequestResponseDto> completeRequest(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getCurrentUser(authentication);
        PeerRequestResponseDto response = peerRequestService.completeRequest(id, user.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * 7. POST /api/peer-requests/{id}/cancel - Requester cancels if status is OPEN
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<PeerRequestResponseDto> cancelRequest(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getCurrentUser(authentication);
        PeerRequestResponseDto response = peerRequestService.cancelRequest(id, user.getId());
        return ResponseEntity.ok(response);
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }
}
