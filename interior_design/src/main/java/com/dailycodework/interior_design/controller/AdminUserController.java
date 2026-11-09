package com.dailycodework.interior_design.controller;

import com.dailycodework.interior_design.dto.AdminProfileResponse;
import com.dailycodework.interior_design.dto.PasswordResetRequest;
import com.dailycodework.interior_design.dto.UpdateUserRequest;
import com.dailycodework.interior_design.model.LoginHistory;
import com.dailycodework.interior_design.model.User;
import com.dailycodework.interior_design.repository.LoginHistoryRepository;
import com.dailycodework.interior_design.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import com.dailycodework.interior_design.repository.UserRepository;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;
    private final LoginHistoryRepository loginHistoryRepository;
    private final UserRepository userRepository;

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Update a user
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        userService.updateUser(id, request);
        return ResponseEntity.ok("User updated");
    }

    // Delete a user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted");
    }

    // Reset user password
    @PutMapping("/{id}/password")
    public ResponseEntity<?> resetPassword(
            @PathVariable Long id,
            @RequestBody PasswordResetRequest request) {

        userService.resetUserPassword(id, request.getNewPassword());
        return ResponseEntity.ok("Password reset");
    }

    // Get current admin info
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    // Get current admin login history
    @GetMapping("/me/history")
    public ResponseEntity<AdminProfileResponse> getCurrentAdminHistory(@AuthenticationPrincipal User user) {
        List<LoginHistory> history = loginHistoryRepository.findByUserOrderByLoginTimeDesc(user);

        List<LocalDateTime> loginTimes = history.stream()
                .map(LoginHistory::getLoginTime)
                .toList();

        AdminProfileResponse response = new AdminProfileResponse(user, loginTimes.size(), loginTimes);
        return ResponseEntity.ok(response);
    }

// Upload or update the current admin's profile picture
@PostMapping(
        value = "/me/profile-picture",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
)
public ResponseEntity<?> uploadProfilePicture(
        @AuthenticationPrincipal User user,
        @RequestParam("file") MultipartFile file
) throws IOException {

    if (file.isEmpty()) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Please select an image."
        );
    }

    if (file.getContentType() == null ||
            !file.getContentType().startsWith("image/")) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only image files are allowed."
        );
    }

    // Store the uploaded image in the current admin's User record
    user.setProfilePicture(file.getBytes());
    userRepository.save(user);

    return ResponseEntity.ok("Profile picture updated successfully.");
}}
    // Upload or update profile picture



// Upload or update profile picture

     // <-- End of AdminUserController class

