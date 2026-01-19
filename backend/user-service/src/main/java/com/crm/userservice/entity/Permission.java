package com.crm.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Permission entity
 * Defines what actions can be performed on resources
 */
@Entity
@Table(name = "permissions", schema = "user_management",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_resource_action", columnNames = {"resource", "action"})
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String resource; // leads, calls, reports, etc.

    @Column(nullable = false)
    private String action; // read, write, delete, assign, etc.

    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public String getFullPermission() {
        return resource + ":" + action;
    }
}
