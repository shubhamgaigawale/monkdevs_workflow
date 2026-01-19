package com.crm.hrservice.repository;

import com.crm.hrservice.entity.HraDeclaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for HraDeclaration entity
 */
@Repository
public interface HraDeclarationRepository extends JpaRepository<HraDeclaration, UUID> {

    @Query("SELECT hd FROM HraDeclaration hd WHERE hd.declaration.id = :declarationId")
    Optional<HraDeclaration> findByDeclarationId(UUID declarationId);

    @Query("SELECT hd FROM HraDeclaration hd WHERE hd.tenantId = :tenantId AND hd.declaration.id = :declarationId")
    Optional<HraDeclaration> findByTenantIdAndDeclarationId(UUID tenantId, UUID declarationId);
}
