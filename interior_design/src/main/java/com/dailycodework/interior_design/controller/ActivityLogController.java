package com.dailycodework.interior_design.controller;

import com.dailycodework.interior_design.entity.ActivityLog;
import com.dailycodework.interior_design.service.ActivityLogService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/activity-logs")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public List<ActivityLog> getActivityLogs(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate,

            @RequestParam(required = false) String username,
            @RequestParam(required = false) String endpoint,
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        boolean authorized = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(role ->
                        role.equals("ROLE_ADMIN")
                                || role.equals("ROLE_MANAGER")
                                || role.equals("ADMIN")
                                || role.equals("MANAGER")
                );

        if (!authorized) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        LocalDateTime start = fromDate == null
                ? null
                : fromDate.atStartOfDay();

        LocalDateTime end = toDate == null
                ? null
                : toDate.plusDays(1).atStartOfDay();

        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The start date cannot be after the end date."
            );
        }

        return activityLogService.search(
                start,
                end,
                username,
                endpoint
        );
    }
}