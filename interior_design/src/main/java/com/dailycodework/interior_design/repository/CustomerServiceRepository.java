package com.dailycodework.interior_design.repository;

import com.dailycodework.interior_design.model.CustomerService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerServiceRepository extends JpaRepository<CustomerService, Long> {
}
