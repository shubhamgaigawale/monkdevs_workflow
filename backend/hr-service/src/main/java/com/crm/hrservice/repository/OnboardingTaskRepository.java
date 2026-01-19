package com.crm.hrservice.repository;

import com.crm.hrservice.entity.OnboardingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OnboardingTaskRepository extends JpaRepository<OnboardingTask, UUID> {

    List<OnboardingTask> findByTemplateIdOrderByTaskOrderAsc(UUID templateId);

    List<OnboardingTask> findByTenantIdAndTemplateIdOrderByTaskOrderAsc(UUID tenantId, UUID templateId);
}
