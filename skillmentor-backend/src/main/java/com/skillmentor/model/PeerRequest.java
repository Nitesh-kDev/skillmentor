package com.skillmentor.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "peer_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeerRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "program", length = 50)
    @Builder.Default
    private Program program = Program.OTHER;

    @Column(name = "domain_subject")
    private String domainSubject; // Flexible subject/domain e.g. "Software Development", "Finance", "Corporate Law"

    private String skillTag; // e.g. "Java", "React" - retained for backward compatibility

    @Column(name = "credit_budget", nullable = false)
    private Integer creditBudget; // Credits offered by requester

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private Status status = Status.OPEN;

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Category {
        SKILL_LEARNING,
        PROJECT_HELP,
        DOUBT_SOLVING,
        ACADEMIC_HELP,
        CAREER_GUIDANCE,
        INTERVIEW_PREPARATION,
        RESUME_PROFILE,
        MENTORSHIP,
        OTHER
    }

    public enum Program {
        BTECH,
        MCA,
        BBA,
        MBA,
        LLB,
        OTHER
    }

    public enum Status {
        OPEN, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
