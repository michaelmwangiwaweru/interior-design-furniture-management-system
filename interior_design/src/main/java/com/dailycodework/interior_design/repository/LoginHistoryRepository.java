package com.dailycodework.interior_design.repository;

import com.dailycodework.interior_design.model.LoginHistory;
import com.dailycodework.interior_design.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    List<LoginHistory> findByUserOrderByLoginTimeDesc(User user);
}
