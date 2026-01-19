package com.crm.campaignservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCampaignRequest {

    private String name;

    private String subject;

    private String previewText;

    private String fromName;

    private String replyTo;

    private LocalDateTime scheduledAt;

    private String content;

    private Map<String, Object> metadata;
}
