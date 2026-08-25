package com.skillmentor.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_action_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private User targetUser;

    @Column(nullable = false)
    private String actionType; // VERIFY_MENTOR, REJECT_MENTOR, SUSPEND_USER, UNSUSPEND_USER, RESOLVE_REPORT

    @Column(columnDefinition = "TEXT")
    private String details;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
