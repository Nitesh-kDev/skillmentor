package com.skillmentor.service;

import com.skillmentor.dto.AuthDtos.UserProfileDto;
import com.skillmentor.dto.SessionDtos.PeerMatchDto;
import com.skillmentor.model.User;
import com.skillmentor.model.UserSkill;
import com.skillmentor.model.Wallet;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.repository.UserSkillRepository;
import com.skillmentor.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final WalletRepository walletRepository;
    private final AuthService authService;

    public List<UserProfileDto> searchMentors(String skill, String college) {
        List<User> mentors;
        String cleanSkill = (skill != null && !skill.trim().isEmpty()) ? skill.trim() : null;
        String cleanCollege = (college != null && !college.trim().isEmpty()) ? college.trim() : null;

        if (cleanSkill != null) {
            mentors = userRepository.findMentorsBySkillAndCollegeSortedByRating(cleanSkill, cleanCollege);
        } else {
            mentors = userRepository.findAllMentorsByCollegeSortedByRating(cleanCollege);
        }

        return mentors.stream()
                .map(m -> authService.getUserProfile(m.getId()))
                .collect(Collectors.toList());
    }

    /**
     * Peer Skill Exchange Matcher Algorithm:
     * Finds peers (Students/Alumni/Mentors) where:
     * 1. Peer offers a skill that current user wants (WANTED by user)
     * 2. Peer wants a skill that current user offers (OFFERED by user)
     */
    public List<PeerMatchDto> findPeerSkillMatches(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkill> mySkills = userSkillRepository.findByUser(currentUser);
        List<String> myOfferedSkills = mySkills.stream()
                .filter(s -> s.getType() == UserSkill.SkillType.OFFERED)
                .map(s -> s.getSkillName().toLowerCase().trim())
                .collect(Collectors.toList());

        List<String> myWantedSkills = mySkills.stream()
                .filter(s -> s.getType() == UserSkill.SkillType.WANTED)
                .map(s -> s.getSkillName().toLowerCase().trim())
                .collect(Collectors.toList());

        // Filter to include ONLY student peers (Student-to-Student horizontal reciprocal skill trade)
        List<User> allOtherUsers = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(userId) && u.getRole() == User.Role.STUDENT)
                .collect(Collectors.toList());

        List<PeerMatchDto> matches = new ArrayList<>();

        for (User peer : allOtherUsers) {
            List<UserSkill> peerSkills = userSkillRepository.findByUser(peer);
            
            // What peer offers
            List<UserSkill> peerOffered = peerSkills.stream()
                    .filter(s -> s.getType() == UserSkill.SkillType.OFFERED)
                    .collect(Collectors.toList());

            // What peer wants
            List<UserSkill> peerWanted = peerSkills.stream()
                    .filter(s -> s.getType() == UserSkill.SkillType.WANTED)
                    .collect(Collectors.toList());

            // Find match where peer offers something I want
            String matchedPeerOffers = peerOffered.stream()
                    .map(UserSkill::getSkillName)
                    .filter(s -> myWantedSkills.contains(s.toLowerCase().trim()))
                    .findFirst().orElse(null);

            // Find match where peer wants something I offer
            String matchedPeerWants = peerWanted.stream()
                    .map(UserSkill::getSkillName)
                    .filter(s -> myOfferedSkills.contains(s.toLowerCase().trim()))
                    .findFirst().orElse(null);

            // Include in peer exchange if peer offers something I want to learn
            if (matchedPeerOffers != null) {
                Wallet peerWallet = walletRepository.findByUser(peer).orElse(null);
                
                String wantsText = matchedPeerWants != null 
                        ? matchedPeerWants 
                        : (!peerWanted.isEmpty() ? peerWanted.get(0).getSkillName() : "10 Peer Credits (Token Swap)");

                matches.add(PeerMatchDto.builder()
                        .peerId(peer.getId())
                        .peerName(peer.getName())
                        .peerEmail(peer.getEmail())
                        .averageRating(peer.getAverageRating())
                        .peerOffersSkill(matchedPeerOffers)
                        .peerWantsSkill(wantsText)
                        .creditBalance(peerWallet != null ? peerWallet.getCreditBalance() : 0)
                        .build());
            }
        }

        return matches;
    }
}
