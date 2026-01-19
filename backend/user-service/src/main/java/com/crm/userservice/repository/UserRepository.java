package com.crm.userservice.repository;

import com.crm.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndTenantId(String email, UUID tenantId);

    List<User> findByTenantId(UUID tenantId);

    Boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.tenantId = :tenantId AND u.isActive = true")
    List<User> findActiveUsersByTenantId(UUID tenantId);
}
