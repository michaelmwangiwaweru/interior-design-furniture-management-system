package com.dailycodework.interior_design.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class ActivityLogInterceptor implements HandlerInterceptor {

    private final ActivityLogService activityLogService;

    public ActivityLogInterceptor(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception exception
    ) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Avoid recording activity-history searches themselves.
        if (path.startsWith("/admin/activity-logs")) {
            return;
        }

        // Ignore browser preflight requests.
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return;
        }

        // Ignore non-application routes.
        if (!(path.startsWith("/api/")
                || path.startsWith("/admin/")
                || path.startsWith("/auth/")
                || path.startsWith("/login"))) {
            return;
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = "ANONYMOUS";
        String role = "UNKNOWN";

        if (authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {

            username = authentication.getName();

            role = authentication.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .reduce((first, second) -> first + ", " + second)
                    .orElse("UNKNOWN");
        }

        try {
            activityLogService.record(
                    username,
                    role,
                    method,
                    path,
                    response.getStatus(),
                    request.getRemoteAddr()
            );
        } catch (Exception loggingError) {
            // A logging failure should not turn a completed request into
            // a failed business operation. Check backend logs for errors.
            System.err.println(
                    "Unable to save activity log: "
                            + loggingError.getMessage()
            );
        }
    }
}