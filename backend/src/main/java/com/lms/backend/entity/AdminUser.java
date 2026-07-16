package com.lms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_users")
public class AdminUser extends BaseUser {

    public AdminUser() {}
    
    public AdminUser(String username, String password, String email, Role role) {
        super(username, password, email, role);
    }
}
