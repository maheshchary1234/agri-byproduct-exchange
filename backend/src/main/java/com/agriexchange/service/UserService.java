package com.agriexchange.service;

import com.agriexchange.config.JwtUtils;
import com.agriexchange.dto.AuthRequest;
import com.agriexchange.dto.AuthResponse;
import com.agriexchange.dto.RegisterRequest;
import com.agriexchange.model.Role;
import com.agriexchange.model.User;
import com.agriexchange.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse register(RegisterRequest req) {
        String username = req.getName();
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required.");
        }

        String email = req.getEmail();
        if (email == null || email.trim().isEmpty()) {
            // Auto generate an email address based on sanitized username or phone
            String slug = (req.getPhone() != null && !req.getPhone().trim().isEmpty()) 
                    ? req.getPhone().replaceAll("[^0-9]", "") 
                    : username.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
            email = slug + "@agriexchange.org";
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this username or email already exists.");
        }

        if (req.getPhone() != null && !req.getPhone().trim().isEmpty() && userRepository.existsByPhone(req.getPhone().trim())) {
            throw new IllegalArgumentException("Mobile number is already registered.");
        }

        Role assignedRole = req.getRole() != null ? req.getRole() : Role.ROLE_FARMER;

        User user = new User(
                username.trim(),
                email.trim(),
                passwordEncoder.encode(req.getPassword()),
                assignedRole,
                req.getPhone() != null ? req.getPhone().trim() : null,
                req.getLandAreaAcres(),
                req.getOrganizationName() != null ? req.getOrganizationName() : (assignedRole == Role.ROLE_FARMER ? "Independent Agricultural Landholder" : "Commercial Biomass Consumer"),
                req.getAddress(),
                req.getDistrict(),
                req.getState(),
                req.getPincode(),
                true // Auto-verified for instant access in dev & platform usage
        );

        User saved = userRepository.save(user);
        String token = jwtUtils.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());

        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name(), saved.getPhone(), saved.getLandAreaAcres(), saved.getOrganizationName(), saved.isVerified());
    }

    public AuthResponse login(AuthRequest req) {
        String identifier = req.getUsername() != null ? req.getUsername().trim() : "";
        if (identifier.isEmpty()) {
            throw new IllegalArgumentException("Username or email is required");
        }

        // Try lookup by Email, then Name, then Phone
        User user = userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByNameIgnoreCase(identifier))
                .or(() -> userRepository.findByPhone(identifier))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        // Validate role if requested
        if (req.getRole() != null && !req.getRole().trim().isEmpty()) {
            String requestedRole = req.getRole().trim().toUpperCase();
            String userRole = user.getRole().name().toUpperCase();
            
            // Normalize: e.g. "FARMER" vs "ROLE_FARMER"
            boolean match = userRole.equals(requestedRole) 
                    || userRole.replace("ROLE_", "").equals(requestedRole.replace("ROLE_", ""));

            if (!match) {
                String prettyUserRole = userRole.replace("ROLE_", "");
                throw new IllegalArgumentException("Role mismatch: This account is registered as " + prettyUserRole + ". Please select the " + prettyUserRole + " role to continue.");
            }
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.getPhone(), user.getLandAreaAcres(), user.getOrganizationName(), user.isVerified());
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
