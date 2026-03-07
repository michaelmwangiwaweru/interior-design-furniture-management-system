package com.dailycodework.interior_design.service;

import com.dailycodework.interior_design.model.LoginHistory;
import com.dailycodework.interior_design.model.User;
import com.dailycodework.interior_design.repository.LoginHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final LoginHistoryRepository loginHistoryRepository;

    // Record a login for a given user
    public void recordLogin(User user) {
        LoginHistory history = new LoginHistory();
        history.setUser(user);
        history.setLoginTime(LocalDateTime.now());
        loginHistoryRepository.save(history);
    }
}
