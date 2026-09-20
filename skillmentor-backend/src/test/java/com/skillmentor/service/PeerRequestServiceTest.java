package com.skillmentor.service;

import com.skillmentor.dto.PeerRequestDtos.CreatePeerRequestDto;
import com.skillmentor.dto.PeerRequestDtos.PeerRequestResponseDto;
import com.skillmentor.exception.BadRequestException;
import com.skillmentor.exception.InsufficientBalanceException;
import com.skillmentor.exception.UnauthorizedAccessException;
import com.skillmentor.model.*;
import com.skillmentor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PeerRequestServiceTest {

    @Mock
    private PeerRequestRepository peerRequestRepository;

    @Mock
    private RequestApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletService walletService;

    @Mock
    private MentorshipSessionRepository sessionRepository;

    @Mock
    private ReciprocalMatchService reciprocalMatchService;

    @InjectMocks
    private PeerRequestService peerRequestService;

    private User requester;
    private User helper;
    private Wallet requesterWallet;
    private Wallet helperWallet;
    private PeerRequest peerRequest;
    private RequestApplication selectedApplication;

    @BeforeEach
    void setUp() {
        requester = User.builder().id(1L).name("Aarav").email("aarav@college.ac.in").build();
        helper = User.builder().id(2L).name("Rohan").email("rohan@college.ac.in").build();

        requesterWallet = Wallet.builder().id(101L).user(requester).creditBalance(50).build();
        helperWallet = Wallet.builder().id(102L).user(helper).creditBalance(50).build();

        peerRequest = PeerRequest.builder()
                .id(100L)
                .requester(requester)
                .title("Java Peer Help")
                .description("Need assistance with Spring Boot")
                .category(PeerRequest.Category.SKILL_LEARNING)
                .program(PeerRequest.Program.MCA)
                .domainSubject("Software Development")
                .skillTag("Java")
                .creditBudget(20)
                .status(PeerRequest.Status.IN_PROGRESS)
                .build();

        selectedApplication = RequestApplication.builder()
                .id(500L)
                .peerRequest(peerRequest)
                .applicant(helper)
                .message("I can help with Java & Spring Boot")
                .status(RequestApplication.Status.SELECTED)
                .build();
    }

    @Test
    void testCompleteRequest_SuccessCreditTransfer() {
        // Arrange
        when(peerRequestRepository.findById(100L)).thenReturn(Optional.of(peerRequest));
        when(applicationRepository.findByPeerRequestIdAndStatus(100L, RequestApplication.Status.SELECTED))
                .thenReturn(Optional.of(selectedApplication));
        when(peerRequestRepository.save(any(PeerRequest.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        PeerRequestResponseDto result = peerRequestService.completeRequest(100L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(PeerRequest.Status.COMPLETED, result.getStatus());

        // Verify WalletService transfer call
        verify(walletService, times(1)).transferCredits(
                eq(1L), eq(2L), eq(20), contains("Completed Student Help Request")
        );
    }

    @Test
    void testCompleteRequest_HelpingStudentCallsCompletion_ThrowsUnauthorizedException() {
        // Arrange: Helper (ID 2L) tries to complete request created by requester (ID 1L)
        when(peerRequestRepository.findById(100L)).thenReturn(Optional.of(peerRequest));

        // Act & Assert
        UnauthorizedAccessException ex = assertThrows(
                UnauthorizedAccessException.class,
                () -> peerRequestService.completeRequest(100L, 2L)
        );

        assertTrue(ex.getMessage().contains("Only the requester can mark this request as COMPLETED"));
        verify(walletService, never()).transferCredits(any(), any(), any(), any());
        verify(peerRequestRepository, never()).save(any(PeerRequest.class));
    }

    @Test
    void testCompleteRequest_AlreadyCompleted_IdempotentNoTransfer() {
        // Arrange: Request is already COMPLETED
        peerRequest.setStatus(PeerRequest.Status.COMPLETED);
        when(peerRequestRepository.findById(100L)).thenReturn(Optional.of(peerRequest));

        // Act
        PeerRequestResponseDto result = peerRequestService.completeRequest(100L, 1L);

        // Assert: Returns completed DTO without transferring credits
        assertNotNull(result);
        assertEquals(PeerRequest.Status.COMPLETED, result.getStatus());
        verify(walletService, never()).transferCredits(any(), any(), any(), any());
    }

    @Test
    void testCompleteRequest_SessionAlreadySettled_NoDoubleTransfer() {
        // Arrange: Associated MentorshipSession was already creditSettled = true
        when(peerRequestRepository.findById(100L)).thenReturn(Optional.of(peerRequest));
        when(applicationRepository.findByPeerRequestIdAndStatus(100L, RequestApplication.Status.SELECTED))
                .thenReturn(Optional.of(selectedApplication));
        when(peerRequestRepository.save(any(PeerRequest.class))).thenAnswer(i -> i.getArgument(0));

        MentorshipSession settledSession = MentorshipSession.builder()
                .id(999L)
                .student(requester)
                .mentor(helper)
                .title("Student Help: Java Peer Help")
                .creditSettled(true)
                .status(MentorshipSession.SessionStatus.COMPLETED)
                .build();
        when(sessionRepository.findByStudentOrMentor(requester, requester)).thenReturn(List.of(settledSession));

        // Act
        PeerRequestResponseDto result = peerRequestService.completeRequest(100L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(PeerRequest.Status.COMPLETED, result.getStatus());
        // Transfer should NOT be called again because session was already creditSettled
        verify(walletService, never()).transferCredits(any(), any(), any(), any());
    }

    @Test
    void testCompleteRequest_CancelledRequest_ThrowsBadRequestException() {
        // Arrange: Request is CANCELLED
        peerRequest.setStatus(PeerRequest.Status.CANCELLED);
        when(peerRequestRepository.findById(100L)).thenReturn(Optional.of(peerRequest));

        // Act & Assert
        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> peerRequestService.completeRequest(100L, 1L)
        );

        assertTrue(ex.getMessage().contains("Cancelled requests cannot be marked COMPLETED"));
        verify(walletService, never()).transferCredits(any(), any(), any(), any());
    }

    @Test
    void testCreatePeerRequest_InsufficientBalance_ThrowsException() {
        // Arrange: Requester wallet has 15 credits, tries to offer budget of 30
        requesterWallet.setCreditBalance(15);
        when(userRepository.findById(1L)).thenReturn(Optional.of(requester));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(requesterWallet));

        CreatePeerRequestDto createDto = CreatePeerRequestDto.builder()
                .title("Project Help")
                .description("Spring Boot Microservices Setup")
                .category(PeerRequest.Category.PROJECT_HELP)
                .program(PeerRequest.Program.BTECH)
                .domainSubject("Software Development")
                .skillTag("Spring Boot")
                .creditBudget(30)
                .build();

        // Act & Assert
        InsufficientBalanceException exception = assertThrows(
                InsufficientBalanceException.class,
                () -> peerRequestService.createPeerRequest(1L, createDto)
        );

        assertTrue(exception.getMessage().contains("Insufficient wallet balance"));
        verify(peerRequestRepository, never()).save(any(PeerRequest.class));
    }
}
