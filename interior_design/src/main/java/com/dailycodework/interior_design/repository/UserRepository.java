package com.dailycodework.interior_design.repository;




import com.dailycodework.interior_design.model.User;  // ← ADD THIS LINE
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}