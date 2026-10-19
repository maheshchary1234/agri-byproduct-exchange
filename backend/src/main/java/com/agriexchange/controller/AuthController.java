package com.agriexchange.controller;

import com.agriexchange.dto.AuthRequest;
import com.agriexchange.dto.AuthResponse;
import com.agriexchange.dto.RegisterRequest;
import com.agriexchange.model.User;
import com.agriexchange.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/register/farmer")
    public ResponseEntity<?> registerFarmer(@RequestBody RegisterRequest request) {
        try {
            request.setRole(com.agriexchange.model.Role.ROLE_FARMER);
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/register/buyer")
    public ResponseEntity<?> registerBuyer(@RequestBody RegisterRequest request) {
        try {
            request.setRole(com.agriexchange.model.Role.ROLE_BUYER);
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.status(401).body(err);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().name());
        profile.put("phone", user.getPhone());
        profile.put("landAreaAcres", user.getLandAreaAcres());
        profile.put("organizationName", user.getOrganizationName());
        profile.put("state", user.getState());
        profile.put("district", user.getDistrict());
        profile.put("isVerified", user.isVerified());
        profile.put("ratingAverage", user.getRatingAverage());
        return ResponseEntity.ok(profile);
    }
}
