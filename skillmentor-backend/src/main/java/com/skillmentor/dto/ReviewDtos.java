package com.skillmentor.dto;

import lombok.*;
import java.time.LocalDateTime;

public class ReviewDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReviewRequest {
        private Long sessionId;
        private Integer rating;
        private String feedback;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReviewResponse {
        private Long id;
        private Long sessionId;
        private Long mentorId;
        private String mentorName;
        private Long studentId;
        private String studentName;
        private Integer rating;
        private String feedback;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChatMessageDto {
        private Long id;
        private Long sessionId;
        private Long senderId;
        private String senderName;
        private String content;
        private LocalDateTime timestamp;
    }
}
