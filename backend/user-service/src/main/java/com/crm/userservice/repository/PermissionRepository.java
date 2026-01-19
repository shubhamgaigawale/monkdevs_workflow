package com.crm.userservice.repository;

import com.crm.userservice.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    Optional<Permission> findByResourceAndAction(String resource, String action);

    Boolean existsByResourceAndAction(String resource, String action);
}
