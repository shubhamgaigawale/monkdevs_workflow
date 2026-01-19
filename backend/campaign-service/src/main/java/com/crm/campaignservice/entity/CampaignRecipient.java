package com.crm.campaignservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "campaign_recipients", schema = "campaign_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CampaignRecipient extends BaseEntity {

    @Column(nullable = false)
    private UUID campaignId;

    @Column(nullable = false)
    private UUID leadId;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 100)
    private String firstName;

    @Column(length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecipientStatus status = RecipientStatus.PENDING;

    @Column(length = 100)
    private String mailchimpMemberId;

    private LocalDateTime sentAt;

    private LocalDateTime openedAt;

    private LocalDateTime clickedAt;

    private LocalDateTime bouncedAt;

    private LocalDateTime unsubscribedAt;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata;

    public enum RecipientStatus {
        PENDING,
        SENT,
        DELIVERED,
        OPENED,
        CLICKED,
        BOUNCED,
        UNSUBSCRIBED,
        FAILED
    }
}
