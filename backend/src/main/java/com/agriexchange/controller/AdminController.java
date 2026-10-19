package com.agriexchange.controller;

import com.agriexchange.dto.DashboardStatsDto;
import com.agriexchange.model.User;
import com.agriexchange.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{id}/toggle-verify")
    public ResponseEntity<User> toggleUserVerification(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserVerification(id));
    }
}
