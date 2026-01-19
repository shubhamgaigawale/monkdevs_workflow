package com.crm.campaignservice.dto.response;

import com.crm.campaignservice.entity.CampaignRecipient;
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
public class CampaignRecipientDTO {

    private UUID id;
    private UUID tenantId;
    private UUID campaignId;
    private UUID leadId;
    private String email;
    private String firstName;
    private String lastName;
    private CampaignRecipient.RecipientStatus status;
    private String mailchimpMemberId;
    private LocalDateTime sentAt;
    private LocalDateTime openedAt;
    private LocalDateTime clickedAt;
    private LocalDateTime bouncedAt;
    private LocalDateTime unsubscribedAt;
    private String errorMessage;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
}
