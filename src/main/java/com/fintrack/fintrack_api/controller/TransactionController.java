package com.fintrack.fintrack_api.controller;

import com.fintrack.fintrack_api.Transaction;
import com.fintrack.fintrack_api.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService service;

    @GetMapping
    public ResponseEntity<List<Transaction>> findAll(@RequestParam String userId) {
        return ResponseEntity.ok(service.findByUser(userId));
    }

    @PostMapping
    public ResponseEntity<Transaction> create(
            @RequestParam String description,
            @RequestParam BigDecimal amount,
            @RequestParam String type,
            @RequestParam String userId) {
        return ResponseEntity.ok(service.create(description, amount, type, userId));
    }

    @GetMapping("/balance")
    public ResponseEntity<BigDecimal> getBalance(@RequestParam String userId) {
        return ResponseEntity.ok(service.getBalance(userId));
    }
}