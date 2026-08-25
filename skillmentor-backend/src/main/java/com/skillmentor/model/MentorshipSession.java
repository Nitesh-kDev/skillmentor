package com.skillmentor.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mentorship_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorshipSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private String title;

    private String topicSkill;

    @Column(nullable = false)
    private LocalDateTime scheduledTime;

    @Builder.Default
    private Integer durationMinutes = 60;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionType sessionType; // PEER_CREDIT, PAID_MENTOR

    @Builder.Default
    private Integer creditCost = 0;

    @Builder.Default
    private Double priceInINR = 0.0;

    @Builder.Default
    private Double originalPriceInINR = 0.0;

    @Builder.Default
    private Boolean sameCollegeAlumniBenefitApplied = false;

    @Builder.Default
    private Boolean paymentRequired = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status; // PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED

    @Builder.Default
    private Boolean creditSettled = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum SessionType {
        PEER_CREDIT, PAID_MENTOR
    }

    public enum SessionStatus {
        PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED
    }
}
