package com.fintrack.fintrack_api.service;

import com.fintrack.fintrack_api.Transaction;
import com.fintrack.fintrack_api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.fintrack.fintrack_api.TransactionType;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository repository;
    private final UserService userService;

    public Transaction create(String description, BigDecimal amount, String type, String userId) {
        var user = userService.findById(userId);

        var tx = Transaction.builder()
                .description(description)
                .amount(amount)
                .type(TransactionType.valueOf(type))
                .date(java.time.LocalDate.now())
                .user(user)
                .build();

        return repository.save(tx);
    }

    public List<Transaction> findByUser(String userId) {
        return repository.findByUserIdOrderByDateDesc(userId);
    }

    public BigDecimal getBalance(String userId) {
        return repository.calculateBalance(userId);
    }
}