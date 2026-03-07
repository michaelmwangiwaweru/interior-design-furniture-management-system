package com.dailycodework.interior_design.repository;

import com.dailycodework.interior_design.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
}
