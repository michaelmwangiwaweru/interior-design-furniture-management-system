package com.dailycodework.interior_design.repository;

import com.dailycodework.interior_design.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
