package com.dailycodework.interior_design.repository;

// Backend: CartItemRepository.java



import com.dailycodework.interior_design.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findBySessionId(String sessionId);
    void deleteBySessionIdAndId(String sessionId, Long id);
}