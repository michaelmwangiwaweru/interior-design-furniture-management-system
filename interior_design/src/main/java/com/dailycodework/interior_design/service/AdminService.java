package com.dailycodework.interior_design.service;

import com.dailycodework.interior_design.model.User;
import com.dailycodework.interior_design.model.Role;
import com.dailycodework.interior_design.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by id
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Create new user (Admin only)
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Update user (Admin only)
    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);
        user.setFullName(updatedUser.getFullName());
        user.setEmail(updatedUser.getEmail());
        user.setMobile(updatedUser.getMobile());
        user.setRole(updatedUser.getRole());
        return userRepository.save(user);
    }

    // Delete user (Admin only)
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // Change admin's own password
    public void changePassword(Long adminId, String oldPassword, String newPassword) {
        User admin = getUserById(adminId);

        if (!passwordEncoder.matches(oldPassword, admin.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        admin.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(admin);
    }
}
