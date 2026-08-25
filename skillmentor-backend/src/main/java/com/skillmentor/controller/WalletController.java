package com.skillmentor.controller;

import com.skillmentor.dto.WalletPaymentDtos.WalletSummaryDto;
import com.skillmentor.dto.WalletPaymentDtos.WalletTransferRequest;
import com.skillmentor.model.User;
import com.skillmentor.model.Wallet;
import com.skillmentor.repository.UserRepository;
import com.skillmentor.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Wallet> getWallet(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(walletService.getWalletByUserId(user.getId()));
    }

    @GetMapping("/summary")
    public ResponseEntity<WalletSummaryDto> getWalletSummary(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(walletService.getWalletSummary(user.getId()));
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transferCredits(Authentication authentication, @RequestBody WalletTransferRequest request) {
        User sender = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        walletService.transferCredits(sender.getId(), request.getRecipientUserId(), request.getAmount(), request.getReason());
        return ResponseEntity.ok("Successfully transferred " + request.getAmount() + " credits.");
    }
}
