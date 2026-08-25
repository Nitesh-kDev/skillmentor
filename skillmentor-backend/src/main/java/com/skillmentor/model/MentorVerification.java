package com.skillmentor.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mentor_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String linkedinUrl;
    private String govtIdDocumentPath;
    private String company;
    private String designation;
    private Integer experienceYears;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStage stage; // PENDING, APPROVED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String reviewerNotes;

    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    public enum VerificationStage {
        PENDING, APPROVED, REJECTED
    }
}
