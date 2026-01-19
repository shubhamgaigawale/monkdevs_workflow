package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Time entry entity - records clock in/out and break times
 */
@Entity
@Table(name = "time_entries", schema = "hr_workflow",
        indexes = {
                @Index(name = "idx_time_tenant_user_date", columnList = "tenant_id, user_id, timestamp")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntry extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false, length = 20)
    private EntryType entryType;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "location_data", columnDefinition = "text")
    private String locationData; // Store as JSON: IP address, geolocation

    @Column(name = "device_info", columnDefinition = "text")
    private String deviceInfo; // Store as JSON: browser, OS, device type

    private String notes;

    public enum EntryType {
        LOGIN,
        LOGOUT,
        BREAK_START,
        BREAK_END
    }
}
