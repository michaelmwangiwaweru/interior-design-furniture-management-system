package com.dailycodework.interior_design.repository;

import com.dailycodework.interior_design.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long> {

    @Query("""
        SELECT a FROM ActivityLog a
        WHERE (:start IS NULL OR a.createdAt >= :start)
          AND (:end IS NULL OR a.createdAt < :end)
          AND (:username IS NULL OR
               LOWER(a.username) LIKE LOWER(CONCAT('%', :username, '%')))
          AND (:endpoint IS NULL OR
               LOWER(a.endpoint) LIKE LOWER(CONCAT('%', :endpoint, '%')))
        ORDER BY a.createdAt DESC
        """)
    List<ActivityLog> searchLogs(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("username") String username,
            @Param("endpoint") String endpoint
    );
}