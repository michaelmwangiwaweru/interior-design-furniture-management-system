package com.dailycodework.interior_design.model;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;  // email
    private String password;
}