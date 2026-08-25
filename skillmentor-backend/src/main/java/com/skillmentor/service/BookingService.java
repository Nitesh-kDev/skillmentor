package com.skillmentor.service;

import com.skillmentor.dto.SessionDtos.*;
import com.skillmentor.model.*;
import com.skillmentor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final MentorshipSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletService walletService;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public BookingResponse createBooking(Long studentId, BookingRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        User mentor = userRepository.findById(request.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor user not found"));

        if (student.getId().equals(mentor.getId())) {
            throw new RuntimeException("You cannot book a session with yourself!");
        }

        // Available Slots Schedule Check
        if (mentor.getAvailableSlots() != null && !mentor.getAvailableSlots().isBlank()) {
            String avail = mentor.getAvailableSlots().trim();
            System.out.println("Booking Validation: Recipient User #" + mentor.getId() + " available schedule is: " + avail);
        }

        // 1. Conflict Validation: Check if mentor/peer is already booked for this exact time
        List<MentorshipSession> mentorConflicts = sessionRepository.findConflictingSessions(
                request.getMentorId(), request.getScheduledTime());
        if (!mentorConflicts.isEmpty()) {
            throw new RuntimeException("The selected mentor/peer already has a session booked at this date and time! Please select a different time slot.");
        }

        // 2. Conflict Validation: Check if the student booking already has an active session at this exact time
        List<MentorshipSession> studentSessions = sessionRepository.findByStudentOrMentor(student, student);
        boolean studentHasConflict = studentSessions.stream()
                .filter(s -> s.getStatus() != MentorshipSession.SessionStatus.CANCELLED && s.getStatus() != MentorshipSession.SessionStatus.REJECTED)
                .anyMatch(s -> s.getScheduledTime() != null && s.getScheduledTime().equals(request.getScheduledTime()));
        if (studentHasConflict) {
            throw new RuntimeException("You already have an active session request or booking for this exact date and time!");
        }

        // Provider Role Session Economy Rule:
        // Requester = STUDENT & Provider = STUDENT -> PEER_CREDIT (10 Credits, No INR)
        // Requester = STUDENT & Provider = MENTOR / ALUMNI -> PAID_MENTOR (INR ₹, Razorpay)
        MentorshipSession.SessionType type;
        if (mentor.getRole() == User.Role.STUDENT) {
            type = MentorshipSession.SessionType.PEER_CREDIT;
        } else {
            type = MentorshipSession.SessionType.PAID_MENTOR;
        }

        int creditCost = type == MentorshipSession.SessionType.PEER_CREDIT ? 10 : 0;

        // Balance Validation for Credit Sessions: Ensure student has enough credits (at least 10 credits)
        if (type == MentorshipSession.SessionType.PEER_CREDIT && creditCost > 0) {
            Wallet studentWallet = walletRepository.findByUser(student).orElse(null);
            int balance = studentWallet != null ? studentWallet.getCreditBalance() : 0;
            if (balance < creditCost) {
                throw new RuntimeException("Insufficient wallet credits! You have " + balance + " credits, but this peer session requires " + creditCost + " credits.");
            }
        }

        double hourlyRate = mentor.getHourlyRate() != null ? mentor.getHourlyRate() : 800.0;
        int durationMin = request.getDurationMinutes() != null ? request.getDurationMinutes() : 60;
        double basePriceInINR = type == MentorshipSession.SessionType.PAID_MENTOR ?
                Math.round((hourlyRate / 60.0) * durationMin * 100.0) / 100.0 : 0.0;

        // SAME-COLLEGE VERIFIED GUIDANCE BENEFIT CALCULATION:
        boolean isSameCollegeAlumni = student.getRole() == User.Role.STUDENT &&
                (mentor.getRole() == User.Role.ALUMNI || mentor.getRole() == User.Role.MENTOR) &&
                mentor.getVerificationStatus() == User.VerificationStatus.VERIFIED &&
                student.getCollegeName() != null && mentor.getCollegeName() != null &&
                student.getCollegeName().trim().equalsIgnoreCase(mentor.getCollegeName().trim());

        double finalPriceInINR = basePriceInINR;
        boolean benefitApplied = false;
        boolean paymentRequired = (type == MentorshipSession.SessionType.PAID_MENTOR);

        if (type == MentorshipSession.SessionType.PAID_MENTOR && isSameCollegeAlumni) {
            User.AlumniBenefitType benefitType = mentor.getAlumniBenefitType() != null ? mentor.getAlumniBenefitType() : User.AlumniBenefitType.NONE;
            if (benefitType == User.AlumniBenefitType.FREE) {
                finalPriceInINR = 0.0;
                benefitApplied = true;
                paymentRequired = false;
            } else if (benefitType == User.AlumniBenefitType.DISCOUNT) {
                int discountPercent = mentor.getAlumniDiscountPercent() != null ? mentor.getAlumniDiscountPercent() : 0;
                if (discountPercent >= 100) {
                    finalPriceInINR = 0.0;
                    benefitApplied = true;
                    paymentRequired = false;
                } else if (discountPercent > 0) {
                    finalPriceInINR = Math.round(basePriceInINR * (1.0 - discountPercent / 100.0) * 100.0) / 100.0;
                    benefitApplied = true;
                    paymentRequired = (finalPriceInINR > 0.0);
                }
            }
        }

        MentorshipSession session = MentorshipSession.builder()
                .student(student)
                .mentor(mentor)
                .title(request.getTitle() != null ? request.getTitle() : (type == MentorshipSession.SessionType.PEER_CREDIT ? "Peer Skill Swap" : "Mentorship Guidance Session"))
                .topicSkill(request.getTopicSkill() != null ? request.getTopicSkill() : "General Guidance")
                .scheduledTime(request.getScheduledTime())
                .durationMinutes(durationMin)
                .sessionType(type)
                .creditCost(creditCost)
                .originalPriceInINR(basePriceInINR)
                .priceInINR(finalPriceInINR)
                .sameCollegeAlumniBenefitApplied(benefitApplied)
                .paymentRequired(paymentRequired)
                .status(MentorshipSession.SessionStatus.PENDING)
                .creditSettled(false)
                .build();

        session = sessionRepository.save(session);

        return mapToBookingResponse(session);
    }

    @Transactional
    public BookingResponse updateSessionStatus(Long sessionId, Long userId, MentorshipSession.SessionStatus newStatus) {
        MentorshipSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getMentor().getId().equals(userId) && !session.getStudent().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update session status");
        }

        session.setStatus(newStatus);
        session = sessionRepository.save(session);

        // IDEMPOTENT AUTOMATED CREDIT TRANSFER: Transfer credits exactly ONCE upon ACCEPTED or COMPLETED!
        if ((newStatus == MentorshipSession.SessionStatus.COMPLETED || newStatus == MentorshipSession.SessionStatus.ACCEPTED) &&
                session.getSessionType() == MentorshipSession.SessionType.PEER_CREDIT &&
                session.getCreditCost() > 0 &&
                !Boolean.TRUE.equals(session.getCreditSettled())) {

            System.out.println("IDEMPOTENT CREDIT SETTLEMENT: Session #" + session.getId() + " marked " + newStatus + ". Transferring " + session.getCreditCost() + " credits from Student #" + session.getStudent().getId() + " to Peer #" + session.getMentor().getId());

            walletService.transferCredits(
                    session.getStudent().getId(),
                    session.getMentor().getId(),
                    session.getCreditCost(),
                    "Completed Peer Skill Swap: " + session.getTitle()
            );

            session.setCreditSettled(true);
            session = sessionRepository.save(session);
        }

        return mapToBookingResponse(session);
    }

    public List<BookingResponse> getUserSessions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MentorshipSession> sessions = sessionRepository.findByStudentOrMentor(user, user);

        return sessions.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MentorSummaryDto getMentorSummary(Long mentorId) {
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new com.skillmentor.exception.ResourceNotFoundException("Mentor user not found"));

        List<MentorshipSession> allSessions = sessionRepository.findByStudentOrMentor(mentor, mentor)
                .stream()
                .filter(s -> s.getMentor().getId().equals(mentorId))
                .collect(Collectors.toList());

        List<Payment> successfulPayments = paymentRepository.findByMentor(mentor)
                .stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS)
                .collect(Collectors.toList());

        double revenue = successfulPayments.stream()
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        int pendingCount = (int) allSessions.stream().filter(s -> s.getStatus() == MentorshipSession.SessionStatus.PENDING).count();
        int upcomingCount = (int) allSessions.stream().filter(s -> s.getStatus() == MentorshipSession.SessionStatus.ACCEPTED).count();
        int completedCount = (int) allSessions.stream().filter(s -> s.getStatus() == MentorshipSession.SessionStatus.COMPLETED).count();

        List<BookingResponse> incoming = allSessions.stream()
                .filter(s -> s.getStatus() == MentorshipSession.SessionStatus.PENDING)
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());

        List<BookingResponse> upcoming = allSessions.stream()
                .filter(s -> s.getStatus() == MentorshipSession.SessionStatus.ACCEPTED || s.getStatus() == MentorshipSession.SessionStatus.COMPLETED)
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());

        return MentorSummaryDto.builder()
                .mentorshipRevenue(Math.round(revenue * 100.0) / 100.0)
                .pendingRequestsCount(pendingCount)
                .upcomingSessionsCount(upcomingCount)
                .completedSessionsCount(completedCount)
                .incomingRequests(incoming)
                .upcomingSessions(upcoming)
                .build();
    }

    public BookingResponse getSessionById(Long sessionId, Long userId) {
        MentorshipSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new com.skillmentor.exception.ResourceNotFoundException("Session not found with ID: " + sessionId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.skillmentor.exception.ResourceNotFoundException("User not found"));

        if (!session.getStudent().getId().equals(userId) && !session.getMentor().getId().equals(userId) && user.getRole() != User.Role.ADMIN) {
            throw new com.skillmentor.exception.UnauthorizedAccessException("You are not authorized to view details of this session");
        }
        return mapToBookingResponse(session);
    }

    private BookingResponse mapToBookingResponse(MentorshipSession session) {
        boolean isSameCollege = session.getStudent() != null && session.getMentor() != null &&
                session.getStudent().getCollegeName() != null && session.getMentor().getCollegeName() != null &&
                session.getStudent().getCollegeName().trim().equalsIgnoreCase(session.getMentor().getCollegeName().trim());

        User mentor = session.getMentor();
        User student = session.getStudent();

        boolean hasBeenReviewed = reviewRepository.findBySessionId(session.getId()).isPresent();
        boolean canReview = !hasBeenReviewed &&
                session.getStatus() == MentorshipSession.SessionStatus.COMPLETED &&
                (mentor.getRole() == User.Role.MENTOR || mentor.getRole() == User.Role.ALUMNI);

        return BookingResponse.builder()
                .id(session.getId())
                .mentorId(mentor.getId())
                .mentorName(mentor.getName())
                .mentorRole(mentor.getRole())
                .studentId(student.getId())
                .studentName(student.getName())
                .studentRole(student.getRole())
                .title(session.getTitle())
                .topicSkill(session.getTopicSkill())
                .scheduledTime(session.getScheduledTime())
                .durationMinutes(session.getDurationMinutes())
                .sessionType(session.getSessionType())
                .creditCost(session.getCreditCost())
                .priceInINR(session.getPriceInINR())
                .originalPriceInINR(session.getOriginalPriceInINR() != null ? session.getOriginalPriceInINR() : session.getPriceInINR())
                .sameCollegeAlumniBenefitApplied(Boolean.TRUE.equals(session.getSameCollegeAlumniBenefitApplied()))
                .alumniBenefitType(mentor.getAlumniBenefitType())
                .alumniDiscountPercent(mentor.getAlumniDiscountPercent())
                .paymentRequired(session.getPaymentRequired() != null ? session.getPaymentRequired() : (session.getSessionType() == MentorshipSession.SessionType.PAID_MENTOR && session.getPriceInINR() > 0))
                .status(session.getStatus())
                .createdAt(session.getCreatedAt())
                .sameCollegeConnection(isSameCollege)
                .hasBeenReviewed(hasBeenReviewed)
                .canReview(canReview)
                .build();
    }
}
