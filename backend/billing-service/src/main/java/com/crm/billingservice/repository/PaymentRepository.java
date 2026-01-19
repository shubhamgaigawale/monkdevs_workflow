package com.crm.billingservice.repository;

import com.crm.billingservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
