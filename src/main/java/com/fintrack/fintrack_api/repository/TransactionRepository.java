package com.fintrack.fintrack_api.repository;

import com.fintrack.fintrack_api.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    List<Transaction> findByUserIdOrderByDateDesc(String userId);

    @Query("SELECT SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE -t.amount END) FROM Transaction t WHERE t.user.id = :userId")
    BigDecimal calculateBalance(String userId);
}