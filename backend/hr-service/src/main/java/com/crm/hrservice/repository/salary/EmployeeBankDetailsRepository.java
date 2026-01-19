package com.crm.hrservice.repository.salary;

import com.crm.hrservice.entity.EmployeeBankDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeBankDetailsRepository extends JpaRepository<EmployeeBankDetails, UUID> {

    Optional<EmployeeBankDetails> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    Optional<EmployeeBankDetails> findByTenantIdAndUserIdAndIsPrimaryTrue(UUID tenantId, UUID userId);

    boolean existsByTenantIdAndUserId(UUID tenantId, UUID userId);
}
