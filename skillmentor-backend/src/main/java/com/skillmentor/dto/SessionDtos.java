package com.skillmentor.dto;

import com.skillmentor.model.MentorshipSession;
import com.skillmentor.model.User;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class SessionDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BookingRequest {
        private Long mentorId;
        private String title;
        private String topicSkill;
        private LocalDateTime scheduledTime;
        private Integer durationMinutes;
        private MentorshipSession.SessionType sessionType;
        private Integer creditCost;
        private Double priceInINR;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BookingResponse {
        private Long id;
        private Long mentorId;
        private String mentorName;
        private User.Role mentorRole;
        private Long studentId;
        private String studentName;
        private User.Role studentRole;
        private String title;
        private String topicSkill;
        private LocalDateTime scheduledTime;
        private Integer durationMinutes;
        private MentorshipSession.SessionType sessionType;
        private Integer creditCost;
        private Double priceInINR;
        private Double originalPriceInINR;
        private Boolean sameCollegeAlumniBenefitApplied;
        private User.AlumniBenefitType alumniBenefitType;
        private Integer alumniDiscountPercent;
        private Boolean paymentRequired;
        private MentorshipSession.SessionStatus status;
        private LocalDateTime createdAt;
        private Boolean sameCollegeConnection;
        private Boolean hasBeenReviewed;
        private Boolean canReview;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SessionStatusUpdate {
        private MentorshipSession.SessionStatus status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PeerMatchDto {
        private Long peerId;
        private String peerName;
        private String peerEmail;
        private Double averageRating;
        private String peerOffersSkill; // What they can teach you
        private String peerWantsSkill;  // What you can teach them
        private Integer creditBalance;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MentorSummaryDto {
        private Double mentorshipRevenue;
        private Integer pendingRequestsCount;
        private Integer upcomingSessionsCount;
        private Integer completedSessionsCount;
        private List<BookingResponse> incomingRequests;
        private List<BookingResponse> upcomingSessions;
    }
}
