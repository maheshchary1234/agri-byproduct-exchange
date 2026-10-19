package com.agriexchange.dto;

public class AuthRequest {
    private String email;
    private String username;
    private String password;
    private String role;

    public AuthRequest() {}
    public AuthRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }
    public AuthRequest(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public String getEmail() { 
        return (email != null && !email.trim().isEmpty()) ? email : username; 
    }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return getEmail(); }
    public void setUsername(String username) { this.username = username; if (this.email == null) this.email = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
