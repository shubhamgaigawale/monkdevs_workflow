package com.crm.campaignservice.dto.request;

import com.crm.campaignservice.entity.Campaign;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCampaignRequest {

    @NotBlank(message = "Campaign name is required")
    private String name;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String previewText;

    @NotBlank(message = "From name is required")
    private String fromName;

    private String replyTo;

    @NotNull(message = "Campaign type is required")
    private Campaign.CampaignType campaignType;

    private LocalDateTime scheduledAt;

    @NotEmpty(message = "At least one recipient is required")
    private List<UUID> leadIds;

    @NotBlank(message = "Content is required")
    private String content;

    private UUID templateId;

    private String mailchimpListId;

    private Map<String, Object> metadata;
}
