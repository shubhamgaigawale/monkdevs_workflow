package com.crm.leadservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "leads", schema = "lead_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Lead extends BaseEntity {

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "company")
    private String company;

    @Column(name = "source", length = 100)
    private String source;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private LeadStatus status = LeadStatus.NEW;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20, nullable = false)
    private LeadPriority priority = LeadPriority.MEDIUM;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_fields", columnDefinition = "jsonb")
    private Map<String, Object> customFields;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum LeadStatus {
        NEW,
        CONTACTED,
        QUALIFIED,
        CONVERTED,
        LOST
    }

    public enum LeadPriority {
        HIGH,
        MEDIUM,
        LOW
    }
}
