package com.skillmentor.dto;

import com.skillmentor.model.PeerRequest;
import com.skillmentor.model.RequestApplication;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class PeerRequestDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreatePeerRequestDto {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Category is required")
        private PeerRequest.Category category;

        private PeerRequest.Program program; // BTECH, MCA, BBA, MBA, LLB, OTHER

        private String domainSubject; // Flexible subject/domain e.g. "Software Development", "Finance"

        private String skillTag; // Retained for backward compatibility

        @NotNull(message = "Credit budget is required")
        @Min(value = 1, message = "Credit budget must be at least 1 credit")
        private Integer creditBudget;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PeerRequestResponseDto {
        private Long id;
        private Long requesterId;
        private String requesterName;
        private String requesterCollege;
        private String title;
        private String description;
        private PeerRequest.Category category;
        private PeerRequest.Program program;
        private String domainSubject;
        private String skillTag;
        private Integer creditBudget;
        private PeerRequest.Status status;
        private LocalDateTime createdAt;
        private Integer applicationCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplyRequestDto {
        @NotBlank(message = "Application message is required")
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RequestApplicationResponseDto {
        private Long id;
        private Long requestId;
        private String requestTitle;
        private Long applicantId;
        private String applicantName;
        private String applicantCollege;
        private String message;
        private RequestApplication.Status status;
        private LocalDateTime createdAt;
    }
}
