package com.crm.integrationservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "e_signatures", schema = "integration_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ESignature extends BaseEntity {

    @Column(name = "lead_id")
    private UUID leadId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "external_id")
    private String externalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", length = 20)
    private SignatureProvider provider;

    @Column(name = "document_name")
    private String documentName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private SignatureStatus status = SignatureStatus.DRAFT;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "document_url", columnDefinition = "TEXT")
    private String documentUrl;

    @Column(name = "signed_url", columnDefinition = "TEXT")
    private String signedUrl;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    public enum SignatureProvider {
        PANDADOC,
        DOCUSIGN
    }

    public enum SignatureStatus {
        DRAFT,
        SENT,
        VIEWED,
        COMPLETED,
        DECLINED,
        EXPIRED
    }
}
