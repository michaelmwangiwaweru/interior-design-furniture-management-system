package com.dailycodework.interior_design.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Data
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Column(unique = true)
    private String email;

    private String password;

    private String mobile;

    @Enumerated(EnumType.STRING)
    private Role role;  // Uses your Role enum

    @Lob
    private byte[] profilePicture; // store image as byte array

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }

    // <<< MOVE THIS INSIDE THE CLASS
    @Transient
    public String getProfilePictureBase64() {
        if (profilePicture != null) {
            return "data:image/jpeg;base64," + java.util.Base64.getEncoder().encodeToString(profilePicture);
        }
        return null;
    }
}
