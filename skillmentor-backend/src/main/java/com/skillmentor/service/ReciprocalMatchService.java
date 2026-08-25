package com.skillmentor.service;

import com.skillmentor.dto.ReciprocalMatchDtos.ReciprocalMatchResponseDto;
import com.skillmentor.exception.BadRequestException;
import com.skillmentor.exception.ResourceNotFoundException;
import com.skillmentor.model.*;
import com.skillmentor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReciprocalMatchService {

    private final ReciprocalMatchRepository matchRepository;
    private final PeerRequestRepository peerRequestRepository;
    private final UserSkillRepository userSkillRepository;
    private final MentorshipSessionRepository sessionRepository;

    /**
     * Checks if a newly created PeerRequest (category = SKILL_LEARNING) has a reciprocal match
     * with another OPEN PeerRequest.
     */
    @Transactional
    public void checkForReciprocalMatches(PeerRequest newRequest) {
        if (newRequest.getCategory() != PeerRequest.Category.SKILL_LEARNING || newRequest.getSkillTag() == null) {
            return;
        }

        User userA = newRequest.getRequester();
        String requestedSkillA = newRequest.getSkillTag().trim().toLowerCase();

        // Get user A's offered / listed skills
        List<String> skillsA = userSkillRepository.findByUserId(userA.getId()).stream()
                .map(s -> s.getSkillName().trim().toLowerCase())
                .collect(Collectors.toList());

        if (skillsA.isEmpty()) {
            return;
        }

        // Find all other OPEN SKILL_LEARNING requests
        List<PeerRequest> openSkillRequests = peerRequestRepository.findByCategoryAndStatus(
                PeerRequest.Category.SKILL_LEARNING, PeerRequest.Status.OPEN
        );

        for (PeerRequest reqB : openSkillRequests) {
            if (reqB.getId().equals(newRequest.getId()) || reqB.getRequester().getId().equals(userA.getId())) {
                continue;
            }

            if (reqB.getSkillTag() == null) {
                continue;
            }

            String requestedSkillB = reqB.getSkillTag().trim().toLowerCase();
            User userB = reqB.getRequester();

            // Get user B's offered skills
            List<String> skillsB = userSkillRepository.findByUserId(userB.getId()).stream()
                    .map(s -> s.getSkillName().trim().toLowerCase())
                    .collect(Collectors.toList());

            // Check reciprocal condition:
            // 1. User A has the skill User B wants (requestedSkillB)
            // 2. User B has the skill User A wants (requestedSkillA)
            boolean aCanTeachB = skillsA.contains(requestedSkillB);
            boolean bCanTeachA = skillsB.contains(requestedSkillA);

            if (aCanTeachB && bCanTeachA) {
                // Check if match already exists
                if (!matchRepository.existsMatchBetweenRequests(newRequest.getId(), reqB.getId())) {
                    ReciprocalMatch match = ReciprocalMatch.builder()
                            .requestA(newRequest)
                            .requestB(reqB)
                            .userA(userA)
                            .userB(userB)
                            .status(ReciprocalMatch.Status.SUGGESTED)
                            .build();

                    matchRepository.save(match);
                }
            }
        }
    }

    public List<ReciprocalMatchResponseDto> getSuggestedMatches(Long userId) {
        List<ReciprocalMatch> matches = matchRepository.findSuggestedOrActiveMatchesForUser(userId);
        return matches.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public ReciprocalMatchResponseDto acceptMatch(Long matchId, Long userId) {
        ReciprocalMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Reciprocal match not found"));

        if (!match.getUserA().getId().equals(userId) && !match.getUserB().getId().equals(userId)) {
            throw new BadRequestException("You are not part of this reciprocal match");
        }

        if (match.getStatus() == ReciprocalMatch.Status.DECLINED) {
            throw new BadRequestException("This reciprocal match has already been declined");
        }

        boolean isUserA = match.getUserA().getId().equals(userId);

        if (isUserA) {
            if (match.getStatus() == ReciprocalMatch.Status.SUGGESTED) {
                match.setStatus(ReciprocalMatch.Status.ACCEPTED_BY_A);
            } else if (match.getStatus() == ReciprocalMatch.Status.ACCEPTED_BY_B) {
                match.setStatus(ReciprocalMatch.Status.CONFIRMED);
            }
        } else { // User B
            if (match.getStatus() == ReciprocalMatch.Status.SUGGESTED) {
                match.setStatus(ReciprocalMatch.Status.ACCEPTED_BY_B);
            } else if (match.getStatus() == ReciprocalMatch.Status.ACCEPTED_BY_A) {
                match.setStatus(ReciprocalMatch.Status.CONFIRMED);
            }
        }

        // If CONFIRMED: mark both PeerRequests as IN_PROGRESS & create reciprocal free sessions
        if (match.getStatus() == ReciprocalMatch.Status.CONFIRMED) {
            PeerRequest reqA = match.getRequestA();
            PeerRequest reqB = match.getRequestB();

            reqA.setStatus(PeerRequest.Status.IN_PROGRESS);
            reqB.setStatus(PeerRequest.Status.IN_PROGRESS);

            peerRequestRepository.save(reqA);
            peerRequestRepository.save(reqB);

            // Create Reciprocal MentorshipSession 1 (User A teaches User B - FREE SWAP, 0 CREDITS)
            MentorshipSession sessionA = MentorshipSession.builder()
                    .student(match.getUserB())
                    .mentor(match.getUserA())
                    .title("Reciprocal Swap: " + reqA.getTitle())
                    .topicSkill(reqA.getSkillTag() != null ? reqA.getSkillTag() : "Direct Swap")
                    .scheduledTime(java.time.LocalDateTime.now())
                    .durationMinutes(60)
                    .sessionType(MentorshipSession.SessionType.PEER_CREDIT)
                    .creditCost(0) // FREE DIRECT SWAP - NO CREDITS DEDUCTED
                    .priceInINR(0.0)
                    .status(MentorshipSession.SessionStatus.ACCEPTED)
                    .build();
            sessionRepository.save(sessionA);

            // Create Reciprocal MentorshipSession 2 (User B teaches User A - FREE SWAP, 0 CREDITS)
            MentorshipSession sessionB = MentorshipSession.builder()
                    .student(match.getUserA())
                    .mentor(match.getUserB())
                    .title("Reciprocal Swap: " + reqB.getTitle())
                    .topicSkill(reqB.getSkillTag() != null ? reqB.getSkillTag() : "Direct Swap")
                    .scheduledTime(java.time.LocalDateTime.now())
                    .durationMinutes(60)
                    .sessionType(MentorshipSession.SessionType.PEER_CREDIT)
                    .creditCost(0) // FREE DIRECT SWAP - NO CREDITS DEDUCTED
                    .priceInINR(0.0)
                    .status(MentorshipSession.SessionStatus.ACCEPTED)
                    .build();
            sessionRepository.save(sessionB);
        }

        match = matchRepository.save(match);
        return mapToDto(match);
    }

    @Transactional
    public ReciprocalMatchResponseDto declineMatch(Long matchId, Long userId) {
        ReciprocalMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Reciprocal match not found"));

        if (!match.getUserA().getId().equals(userId) && !match.getUserB().getId().equals(userId)) {
            throw new BadRequestException("You are not part of this reciprocal match");
        }

        match.setStatus(ReciprocalMatch.Status.DECLINED);

        // Reset requests to OPEN if they were in progress due to this match
        PeerRequest reqA = match.getRequestA();
        PeerRequest reqB = match.getRequestB();

        if (reqA.getStatus() == PeerRequest.Status.IN_PROGRESS) {
            reqA.setStatus(PeerRequest.Status.OPEN);
            peerRequestRepository.save(reqA);
        }
        if (reqB.getStatus() == PeerRequest.Status.IN_PROGRESS) {
            reqB.setStatus(PeerRequest.Status.OPEN);
            peerRequestRepository.save(reqB);
        }

        match = matchRepository.save(match);
        return mapToDto(match);
    }

    private ReciprocalMatchResponseDto mapToDto(ReciprocalMatch m) {
        return ReciprocalMatchResponseDto.builder()
                .id(m.getId())
                .requestAId(m.getRequestA().getId())
                .requestATitle(m.getRequestA().getTitle())
                .skillTagA(m.getRequestA().getSkillTag())
                .requestBId(m.getRequestB().getId())
                .requestBTitle(m.getRequestB().getTitle())
                .skillTagB(m.getRequestB().getSkillTag())
                .userAId(m.getUserA().getId())
                .userAName(m.getUserA().getName())
                .userACollege(m.getUserA().getCollegeName())
                .userBId(m.getUserB().getId())
                .userBName(m.getUserB().getName())
                .userBCollege(m.getUserB().getCollegeName())
                .status(m.getStatus())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
