package com.dailycodework.interior_design.dto;

import com.dailycodework.interior_design.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String fullName;
    private String email;
    private String mobile;
    private Role role;
}
