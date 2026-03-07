package com.dailycodework.interior_design.dto;

import com.dailycodework.interior_design.model.User;
import java.time.LocalDateTime;
import java.util.List;

public class AdminProfileResponse {

    private User user;
    private int totalLogins;
    private List<LocalDateTime> loginTimes;

    public AdminProfileResponse(User user, int totalLogins, List<LocalDateTime> loginTimes) {
        this.user = user;
        this.totalLogins = totalLogins;
        this.loginTimes = loginTimes;
    }

    public User getUser() {
        return user;
    }

    public int getTotalLogins() {
        return totalLogins;
    }

    public List<LocalDateTime> getLoginTimes() {
        return loginTimes;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setTotalLogins(int totalLogins) {
        this.totalLogins = totalLogins;
    }

    public void setLoginTimes(List<LocalDateTime> loginTimes) {
        this.loginTimes = loginTimes;
    }
}
