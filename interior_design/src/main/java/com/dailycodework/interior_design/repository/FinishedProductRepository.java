package com.dailycodework.interior_design.repository;

import com.dailycodework.interior_design.model.FinishedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinishedProductRepository extends JpaRepository<FinishedProduct, Long> {
}
