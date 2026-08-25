package com.skillmentor.dto;

import com.skillmentor.model.ReciprocalMatch;
import lombok.*;

import java.time.LocalDateTime;

public class ReciprocalMatchDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReciprocalMatchResponseDto {
        private Long id;
        private Long requestAId;
        private String requestATitle;
        private String skillTagA;

        private Long requestBId;
        private String requestBTitle;
        private String skillTagB;

        private Long userAId;
        private String userAName;
        private String userACollege;

        private Long userBId;
        private String userBName;
        private String userBCollege;

        private ReciprocalMatch.Status status;
        private LocalDateTime createdAt;
    }
}
