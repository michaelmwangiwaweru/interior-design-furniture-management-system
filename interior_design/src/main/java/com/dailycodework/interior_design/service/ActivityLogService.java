package com.dailycodework.interior_design.service;

import com.dailycodework.interior_design.entity.ActivityLog;
import com.dailycodework.interior_design.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository repository;

    public ActivityLogService(ActivityLogRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void record(
            String username,
            String role,
            String method,
            String endpoint,
            int statusCode,
            String ipAddress
    ) {
        ActivityLog log = new ActivityLog();

        log.setUsername(username);
        log.setRole(role);
        log.setHttpMethod(method);
        log.setEndpoint(endpoint);
        log.setStatusCode(statusCode);
        log.setIpAddress(ipAddress);

        repository.save(log);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> search(
            LocalDateTime start,
            LocalDateTime end,
            String username,
            String endpoint
    ) {
        return repository.searchLogs(
                start,
                end,
                clean(username),
                clean(endpoint)
        );
    }

    private String clean(String value) {
        return value == null || value.isBlank()
                ? null
                : value.trim();
    }
}