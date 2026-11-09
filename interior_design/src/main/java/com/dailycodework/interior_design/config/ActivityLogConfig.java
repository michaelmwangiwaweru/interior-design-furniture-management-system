package com.dailycodework.interior_design.config;

import com.dailycodework.interior_design.service.ActivityLogInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ActivityLogConfig implements WebMvcConfigurer {

    private final ActivityLogInterceptor activityLogInterceptor;

    public ActivityLogConfig(
            ActivityLogInterceptor activityLogInterceptor
    ) {
        this.activityLogInterceptor = activityLogInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(activityLogInterceptor);
    }
}