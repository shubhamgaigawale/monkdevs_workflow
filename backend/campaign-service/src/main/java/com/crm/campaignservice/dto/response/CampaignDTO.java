package com.crm.campaignservice.dto.response;

import com.crm.campaignservice.entity.Campaign;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignDTO {

    private UUID id;
    private UUID tenantId;
    private UUID userId;
    private String name;
    private String subject;
    private String previewText;
    private String fromName;
    private String replyTo;
    private Campaign.CampaignStatus status;
    private Campaign.CampaignType campaignType;
    private String mailchimpCampaignId;
    private LocalDateTime scheduledAt;
    private LocalDateTime sentAt;
    private Integer totalRecipients;
    private Integer emailsSent;
    private Integer opens;
    private Integer uniqueOpens;
    private Integer clicks;
    private Integer uniqueClicks;
    private Integer bounces;
    private Integer unsubscribes;
    private String content;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Calculated fields
    private Double openRate;
    private Double clickRate;
    private Double bounceRate;
    private Double unsubscribeRate;
}
