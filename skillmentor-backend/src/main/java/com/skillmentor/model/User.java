package com.skillmentor.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // STUDENT, MENTOR, ALUMNI

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus; // UNVERIFIED, PENDING, VERIFIED

    private String collegeEmail;
    private String linkedinUrl;
    private String govtIdUrl;
    private String govtIdType; // e.g. "Aadhaar Card", "PAN Card", "Passport", "College ID"
    private String govtIdNumber; // e.g. "1234-5678-9012"

    // College & Career Affiliation Fields
    private String collegeName;
    private String course;
    private String currentYear; // e.g. "1st Year", "2nd Year", "3rd Year", "4th Year"
    private Integer passingYear; // e.g. 2020, 2027
    private String currentCompany; // For Mentors / Alumni
    private String currentDesignation; // For Mentors / Alumni
    private String availableSlots; // e.g. "Mon, Wed, Fri (6:00 PM - 9:00 PM)"

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Double hourlyRate; // For paid mentor sessions in INR (₹)
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AlumniBenefitType alumniBenefitType = AlumniBenefitType.NONE;

    @Builder.Default
    private Integer alumniDiscountPercent = 0;

    @Builder.Default
    private Double averageRating = 0.0;

    @Builder.Default
    private Integer totalReviews = 0;

    @Builder.Default
    private Boolean isSuspended = false;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String otpCode;
    private LocalDateTime otpExpiry;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        STUDENT, MENTOR, ALUMNI, ADMIN
    }

    public enum VerificationStatus {
        UNVERIFIED, PENDING, VERIFIED, REJECTED
    }

    public enum AlumniBenefitType {
        NONE, FREE, DISCOUNT
    }
}
