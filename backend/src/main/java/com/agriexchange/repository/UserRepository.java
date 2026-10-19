package com.agriexchange.repository;

import com.agriexchange.model.Role;
import com.agriexchange.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByName(String name);
    Optional<User> findByNameIgnoreCase(String name);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByName(String name);
    boolean existsByPhone(String phone);
    List<User> findByRole(Role role);
    long countByRole(Role role);
}
