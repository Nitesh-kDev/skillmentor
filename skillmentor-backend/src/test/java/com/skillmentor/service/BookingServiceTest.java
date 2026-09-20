package com.skillmentor.service;

import com.skillmentor.dto.SessionDtos.BookingRequest;
import com.skillmentor.dto.SessionDtos.BookingResponse;
import com.skillmentor.exception.UnauthorizedAccessException;
import com.skillmentor.model.MentorshipSession;
import com.skillmentor.model.PeerRequest;
import com.skillmentor.model.User;
import com.skillmentor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private MentorshipSessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletService walletService;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private PeerRequestRepository peerRequestRepository;

    @InjectMocks
    private BookingService bookingService;

    private User requester;
    private User helper;
    private MentorshipSession helpSession;
    private PeerRequest peerRequest;

    @BeforeEach
    void setUp() {
        requester = User.builder().id(1L).name("Aarav").role(User.Role.STUDENT).email("aarav@college.ac.in").build();
        helper = User.builder().id(2L).name("Rohan").role(User.Role.STUDENT).email("rohan@college.ac.in").build();

        peerRequest = PeerRequest.builder()
                .id(100L)
                .requester(requester)
                .title("Need Spring Boot Help")
                .status(PeerRequest.Status.IN_PROGRESS)
                .creditBudget(10)
                .build();

        helpSession = MentorshipSession.builder()
                .id(50L)
                .student(requester)
                .mentor(helper)
                .title("Student Help: Need Spring Boot Help")
                .sessionType(MentorshipSession.SessionType.PEER_CREDIT)
                .creditCost(10)
                .scheduledTime(LocalDateTime.now())
                .status(MentorshipSession.SessionStatus.ACCEPTED)
                .creditSettled(false)
                .build();
    }

    @Test
    void testUpdateSessionStatus_HelpingStudentCompletesHelpRequest_ThrowsUnauthorizedException() {
        // Arrange: Helper (ID 2L) tries to mark the student help request session COMPLETED
        when(sessionRepository.findById(50L)).thenReturn(Optional.of(helpSession));

        // Act & Assert
        UnauthorizedAccessException ex = assertThrows(
                UnauthorizedAccessException.class,
                () -> bookingService.updateSessionStatus(50L, 2L, MentorshipSession.SessionStatus.COMPLETED)
        );

        assertTrue(ex.getMessage().contains("Only the requesting student"));
        verify(walletService, never()).transferCredits(any(), any(), any(), any());
    }

    @Test
    void testUpdateSessionStatus_RequestingStudentCompletesHelpRequest_SuccessAndSyncs() {
        // Arrange: Requesting student (ID 1L) marks the student help request session COMPLETED
        when(sessionRepository.findById(50L)).thenReturn(Optional.of(helpSession));
        when(sessionRepository.save(any(MentorshipSession.class))).thenAnswer(i -> i.getArgument(0));
        when(peerRequestRepository.findByRequesterId(1L)).thenReturn(List.of(peerRequest));
        when(peerRequestRepository.save(any(PeerRequest.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        BookingResponse response = bookingService.updateSessionStatus(50L, 1L, MentorshipSession.SessionStatus.COMPLETED);

        // Assert
        assertNotNull(response);
        assertEquals(MentorshipSession.SessionStatus.COMPLETED, response.getStatus());

        // Verify credit transfer occurred exactly once
        verify(walletService, times(1)).transferCredits(eq(1L), eq(2L), eq(10), contains("Completed Peer Skill Swap"));

        // Verify session creditSettled is now true
        assertTrue(helpSession.getCreditSettled());

        // Verify PeerRequest synchronized to COMPLETED
        assertEquals(PeerRequest.Status.COMPLETED, peerRequest.getStatus());
        verify(peerRequestRepository, times(1)).save(peerRequest);
    }

    @Test
    void testUpdateSessionStatus_AlreadySettledSession_NoDoubleTransfer() {
        // Arrange: Session was already credit settled
        helpSession.setCreditSettled(true);
        when(sessionRepository.findById(50L)).thenReturn(Optional.of(helpSession));
        when(sessionRepository.save(any(MentorshipSession.class))).thenAnswer(i -> i.getArgument(0));
        when(peerRequestRepository.findByRequesterId(1L)).thenReturn(List.of(peerRequest));

        // Act
        BookingResponse response = bookingService.updateSessionStatus(50L, 1L, MentorshipSession.SessionStatus.COMPLETED);

        // Assert
        assertNotNull(response);
        assertEquals(MentorshipSession.SessionStatus.COMPLETED, response.getStatus());
        // Verify wallet transfer was NOT called again
        verify(walletService, never()).transferCredits(any(), any(), any(), any());
    }

    @Test
    void testCreateBooking_ReciprocalSwap_ZeroCreditCost() {
        BookingRequest request = BookingRequest.builder()
                .mentorId(2L)
                .title("react")
                .topicSkill("React")
                .scheduledTime(LocalDateTime.now().plusDays(1))
                .durationMinutes(60)
                .creditCost(0)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(requester));
        when(userRepository.findById(2L)).thenReturn(Optional.of(helper));
        when(sessionRepository.findByStudentOrMentor(requester, requester)).thenReturn(List.of());
        when(sessionRepository.save(any(MentorshipSession.class))).thenAnswer(i -> {
            MentorshipSession s = i.getArgument(0);
            s.setId(99L);
            return s;
        });

        BookingResponse response = bookingService.createBooking(1L, request);

        assertNotNull(response);
        assertEquals(0, response.getCreditCost());
        assertTrue(response.getTitle().contains("Reciprocal Swap:"));
        verify(walletRepository, never()).findByUser(any());
    }

    @Test
    void testUpdateSessionStatus_ReciprocalSwapCompleted_NoCreditsTransferred() {
        MentorshipSession reciprocalSession = MentorshipSession.builder()
                .id(60L)
                .student(requester)
                .mentor(helper)
                .title("Reciprocal Swap: react")
                .sessionType(MentorshipSession.SessionType.PEER_CREDIT)
                .creditCost(0)
                .scheduledTime(LocalDateTime.now())
                .status(MentorshipSession.SessionStatus.ACCEPTED)
                .creditSettled(true)
                .build();

        when(sessionRepository.findById(60L)).thenReturn(Optional.of(reciprocalSession));
        when(sessionRepository.save(any(MentorshipSession.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponse response = bookingService.updateSessionStatus(60L, 1L, MentorshipSession.SessionStatus.COMPLETED);

        assertNotNull(response);
        assertEquals(MentorshipSession.SessionStatus.COMPLETED, response.getStatus());
        verify(walletService, never()).transferCredits(any(), any(), any(), any());
    }
}
