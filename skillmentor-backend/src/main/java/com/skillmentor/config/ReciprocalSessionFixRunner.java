package com.skillmentor.config;

import com.skillmentor.model.MentorshipSession;
import com.skillmentor.model.Wallet;
import com.skillmentor.repository.MentorshipSessionRepository;
import com.skillmentor.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Order(100)
@RequiredArgsConstructor
public class ReciprocalSessionFixRunner implements CommandLineRunner {

    private final MentorshipSessionRepository sessionRepository;
    private final WalletRepository walletRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            List<MentorshipSession> sessions = sessionRepository.findAll();
            for (MentorshipSession s : sessions) {
                if (s.getSessionType() == MentorshipSession.SessionType.PEER_CREDIT) {
                    boolean isTargetSession = (s.getId() != null && s.getId() == 6L) || (
                            s.getTitle() != null && "react".equalsIgnoreCase(s.getTitle().trim())
                            && s.getTopicSkill() != null && "React".equalsIgnoreCase(s.getTopicSkill().trim())
                            && s.getCreditCost() != null && s.getCreditCost() == 10
                    );

                    if (isTargetSession && s.getCreditCost() != null && s.getCreditCost() > 0) {
                        System.out.println("REPAIRING RECIPROCAL SESSION #" + s.getId() + ": '" + s.getTitle() + "'");
                        s.setCreditCost(0);
                        s.setTitle("Reciprocal Swap: react");
                        s.setCreditSettled(true);
                        sessionRepository.save(s);

                        // Refund the 10 credits to the student (Himanshu) from the mentor (Adarsh)
                        if (s.getStatus() == MentorshipSession.SessionStatus.COMPLETED) {
                            Wallet studentWallet = walletRepository.findByUser(s.getStudent()).orElse(null);
                            Wallet mentorWallet = walletRepository.findByUser(s.getMentor()).orElse(null);
                            if (studentWallet != null && mentorWallet != null) {
                                studentWallet.setCreditBalance(studentWallet.getCreditBalance() + 10);
                                mentorWallet.setCreditBalance(Math.max(0, mentorWallet.getCreditBalance() - 10));
                                walletRepository.save(studentWallet);
                                walletRepository.save(mentorWallet);
                                log.info("Successfully refunded 10 credits to student #{} (New Bal: {}) from peer #{} (New Bal: {})",
                                        s.getStudent().getId(), studentWallet.getCreditBalance(),
                                        s.getMentor().getId(), mentorWallet.getCreditBalance());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error executing ReciprocalSessionFixRunner: {}", e.getMessage(), e);
        }
    }
}
