package com.skillmentor.repository;

import com.skillmentor.model.Wallet;
import com.skillmentor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser(User user);
    Optional<Wallet> findByUserId(Long userId);

    @Modifying
    @Query("UPDATE Wallet w SET w.creditBalance = w.creditBalance - :amount, w.updatedAt = CURRENT_TIMESTAMP WHERE w.user.id = :userId AND w.creditBalance >= :amount")
    int deductCreditsAtomic(@Param("userId") Long userId, @Param("amount") Integer amount);

    @Modifying
    @Query("UPDATE Wallet w SET w.creditBalance = w.creditBalance + :amount, w.updatedAt = CURRENT_TIMESTAMP WHERE w.user.id = :userId")
    int addCreditsAtomic(@Param("userId") Long userId, @Param("amount") Integer amount);
}
