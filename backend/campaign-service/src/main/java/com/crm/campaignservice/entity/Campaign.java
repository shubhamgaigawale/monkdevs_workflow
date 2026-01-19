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
@Table(name = "campaigns", schema = "campaign_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Campaign extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String subject;

    @Column(length = 500)
    private String previewText;

    @Column(length = 255)
    private String fromName;

    @Column(length = 255)
    private String replyTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignStatus status = CampaignStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignType campaignType = CampaignType.EMAIL;

    @Column(length = 100)
    private String mailchimpCampaignId;

    private LocalDateTime scheduledAt;

    private LocalDateTime sentAt;

    private Integer totalRecipients = 0;

    private Integer emailsSent = 0;

    private Integer opens = 0;

    private Integer uniqueOpens = 0;

    private Integer clicks = 0;

    private Integer uniqueClicks = 0;

    private Integer bounces = 0;

    private Integer unsubscribes = 0;

    @Column(columnDefinition = "TEXT")
    private String content;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata;

    @Column(nullable = false)
    private UUID userId;

    public enum CampaignStatus {
        DRAFT,
        SCHEDULED,
        SENDING,
        SENT,
        PAUSED,
        CANCELLED
    }

    public enum CampaignType {
        EMAIL,
        SMS,
        MIXED
    }
}
