package com.skillmentor.repository;

import com.skillmentor.model.Payment;
import com.skillmentor.model.MentorshipSession;
import com.skillmentor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findBySession(MentorshipSession session);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);
    boolean existsByRazorpayPaymentId(String razorpayPaymentId);
    List<Payment> findByStudent(User student);
    List<Payment> findByMentor(User mentor);
}
