package com.crm.hrservice.repository.salary;

import com.crm.hrservice.entity.SalaryComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryComponentRepository extends JpaRepository<SalaryComponent, UUID> {

    List<SalaryComponent> findByTenantIdAndStatus(UUID tenantId, SalaryComponent.Status status);

    List<SalaryComponent> findByTenantIdOrderByDisplayOrder(UUID tenantId);

    List<SalaryComponent> findByTenantIdAndComponentType(UUID tenantId, SalaryComponent.ComponentType componentType);

    Optional<SalaryComponent> findByTenantIdAndCode(UUID tenantId, String code);

    boolean existsByTenantIdAndCode(UUID tenantId, String code);
}
