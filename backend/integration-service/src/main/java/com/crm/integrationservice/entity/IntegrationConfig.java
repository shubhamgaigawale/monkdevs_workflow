package com.crm.integrationservice.entity;

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
@Table(name = "integration_configs", schema = "integration_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class IntegrationConfig extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "integration_type", length = 50, nullable = false)
    private IntegrationType integrationType;

    @Column(name = "is_enabled")
    private Boolean isEnabled = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config_data", columnDefinition = "jsonb")
    private Map<String, Object> configData;

    public enum IntegrationType {
        CALENDLY,
        RINGCENTRAL,
        PANDADOC,
        DOCUSIGN,
        MAILCHIMP
    }
}
