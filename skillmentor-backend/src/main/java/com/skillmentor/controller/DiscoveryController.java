package com.skillmentor.controller;

import com.skillmentor.dto.AuthDtos.UserProfileDto;
import com.skillmentor.dto.SessionDtos.PeerMatchDto;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.DiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;
    private final UserRepository userRepository;

    @GetMapping("/mentors")
    public ResponseEntity<List<UserProfileDto>> searchMentors(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String college) {
        return ResponseEntity.ok(discoveryService.searchMentors(skill, college));
    }

    @GetMapping("/peer-matches")
    public ResponseEntity<List<PeerMatchDto>> getPeerMatches(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(discoveryService.findPeerSkillMatches(user.getId()));
    }
}
