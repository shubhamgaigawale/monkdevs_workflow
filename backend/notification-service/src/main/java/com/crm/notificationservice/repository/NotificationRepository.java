package com.crm.notificationservice.repository;

import com.crm.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByTenantIdAndStatus(UUID tenantId, Notification.NotificationStatus status);
    List<Notification> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
