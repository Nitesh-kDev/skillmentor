package com.skillmentor.service;

import com.skillmentor.dto.ReviewDtos.ChatMessageDto;
import com.skillmentor.exception.ResourceNotFoundException;
import com.skillmentor.exception.UnauthorizedAccessException;
import com.skillmentor.model.ChatMessage;
import com.skillmentor.model.MentorshipSession;
import com.skillmentor.model.User;
import com.skillmentor.repository.ChatMessageRepository;
import com.skillmentor.repository.MentorshipSessionRepository;
import com.skillmentor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final MentorshipSessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessageDto saveMessage(Long sessionId, Long authenticatedUserId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new com.skillmentor.exception.BadRequestException("Chat message content cannot be empty.");
        }
        if (content.length() > 2000) {
            throw new com.skillmentor.exception.BadRequestException("Chat message content exceeds maximum allowed limit of 2000 characters.");
        }

        MentorshipSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        User sender = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender user not found"));

        if (session.getStatus() == MentorshipSession.SessionStatus.CANCELLED || session.getStatus() == MentorshipSession.SessionStatus.REJECTED) {
            throw new com.skillmentor.exception.BadRequestException("Live Chat is unavailable for cancelled or rejected sessions.");
        }

        // Session Membership Authorization Check
        boolean isStudent = session.getStudent().getId().equals(authenticatedUserId);
        boolean isMentor = session.getMentor().getId().equals(authenticatedUserId);
        boolean isAdmin = sender.getRole() == User.Role.ADMIN;

        if (!isStudent && !isMentor && !isAdmin) {
            throw new UnauthorizedAccessException("You are not authorized to send messages in this session chat");
        }

        ChatMessage message = ChatMessage.builder()
                .sessionId(sessionId)
                .senderId(sender.getId())
                .senderName(sender.getName())
                .content(content.trim())
                .build();

        message = chatMessageRepository.save(message);

        return ChatMessageDto.builder()
                .id(message.getId())
                .sessionId(message.getSessionId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .build();
    }

    public List<ChatMessageDto> getChatHistory(Long sessionId, Long authenticatedUserId) {
        MentorshipSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Session Membership Authorization Check
        boolean isStudent = session.getStudent().getId().equals(authenticatedUserId);
        boolean isMentor = session.getMentor().getId().equals(authenticatedUserId);
        boolean isAdmin = user.getRole() == User.Role.ADMIN;

        if (!isStudent && !isMentor && !isAdmin) {
            throw new UnauthorizedAccessException("You are not authorized to view chat logs for this session");
        }

        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);

        return messages.stream().map(m -> ChatMessageDto.builder()
                .id(m.getId())
                .sessionId(m.getSessionId())
                .senderId(m.getSenderId())
                .senderName(m.getSenderName())
                .content(m.getContent())
                .timestamp(m.getTimestamp())
                .build()).collect(Collectors.toList());
    }
}
