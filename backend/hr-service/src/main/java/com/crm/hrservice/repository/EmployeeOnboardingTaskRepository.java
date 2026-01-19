package com.crm.hrservice.repository;

import com.crm.hrservice.entity.EmployeeOnboardingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeOnboardingTaskRepository extends JpaRepository<EmployeeOnboardingTask, UUID> {

    List<EmployeeOnboardingTask> findByOnboardingIdOrderByTaskOrderAsc(UUID onboardingId);

    List<EmployeeOnboardingTask> findByTenantIdAndAssignedToUserIdAndStatus(
            UUID tenantId, UUID assignedToUserId, EmployeeOnboardingTask.TaskStatus status);

    Optional<EmployeeOnboardingTask> findByTenantIdAndId(UUID tenantId, UUID id);

    @Query("SELECT COUNT(eot) FROM EmployeeOnboardingTask eot WHERE eot.onboarding.id = :onboardingId AND eot.status = 'COMPLETED'")
    long countCompletedTasksByOnboardingId(@Param("onboardingId") UUID onboardingId);

    @Query("SELECT COUNT(eot) FROM EmployeeOnboardingTask eot WHERE eot.onboarding.id = :onboardingId")
    long countTotalTasksByOnboardingId(@Param("onboardingId") UUID onboardingId);
}
