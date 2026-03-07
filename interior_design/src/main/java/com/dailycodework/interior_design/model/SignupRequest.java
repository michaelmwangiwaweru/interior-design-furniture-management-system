package com.dailycodework.interior_design.model;

import lombok.Data;

@Data
public class SignupRequest {
    private String fullName;
    private String email;
    private String password;
    private String role;   // String like "ROLE_CUSTOMER" or "ROLE_ADMIN"
    private String mobile;
}