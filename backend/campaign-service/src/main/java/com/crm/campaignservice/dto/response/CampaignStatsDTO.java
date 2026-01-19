package com.crm.campaignservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignStatsDTO {

    private Long totalCampaigns;
    private Long draftCampaigns;
    private Long scheduledCampaigns;
    private Long sentCampaigns;
    private Integer totalRecipients;
    private Integer totalEmailsSent;
    private Integer totalOpens;
    private Integer totalClicks;
    private Double averageOpenRate;
    private Double averageClickRate;
}
