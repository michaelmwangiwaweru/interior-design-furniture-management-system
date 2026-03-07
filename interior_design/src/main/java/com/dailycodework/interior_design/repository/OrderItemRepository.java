package com.dailycodework.interior_design.repository;

import com.dailycodework.interior_design.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<CustomerOrder, Long> {
}
