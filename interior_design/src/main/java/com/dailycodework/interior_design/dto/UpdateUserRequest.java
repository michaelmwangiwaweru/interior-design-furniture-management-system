package com.dailycodework.interior_design.dto;

import com.dailycodework.interior_design.model.Role;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String fullName;
    private String email;
    private String mobile;
    private Role role;
}
