package com.skillmentor.controller;

import com.skillmentor.dto.ReviewDtos.ChatMessageDto;
import com.skillmentor.exception.ResourceNotFoundException;
import com.skillmentor.model.User;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // WebSocket STOMP real-time destination: /app/chat.send/{sessionId}
    @MessageMapping("/chat.send/{sessionId}")
    public void sendMessage(@DestinationVariable Long sessionId, Principal principal, @Payload ChatMessageDto dto) {
        if (principal == null) return;
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return;

        ChatMessageDto savedMsg = chatService.saveMessage(sessionId, user.getId(), dto.getContent());
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, savedMsg);
    }

    // REST HTTP fallback for posting chat messages & broadcasting over WebSocket
    @PostMapping("/api/chat/send")
    @ResponseBody
    public ResponseEntity<ChatMessageDto> postMessage(Authentication authentication, @RequestBody ChatMessageDto dto) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ChatMessageDto savedMsg = chatService.saveMessage(dto.getSessionId(), user.getId(), dto.getContent());
        messagingTemplate.convertAndSend("/topic/session/" + dto.getSessionId(), savedMsg);
        return ResponseEntity.ok(savedMsg);
    }

    // REST endpoint to load historical chat logs
    @GetMapping("/api/chat/history/{sessionId}")
    @ResponseBody
    public ResponseEntity<List<ChatMessageDto>> getHistory(Authentication authentication, @PathVariable Long sessionId) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(chatService.getChatHistory(sessionId, user.getId()));
    }
}
