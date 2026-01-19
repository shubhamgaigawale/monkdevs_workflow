package com.crm.leadservice.dto.response;

import com.crm.leadservice.entity.Lead;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadStatsDTO {

    private Long totalLeads;

    private Long assignedLeads;

    private Long unassignedLeads;

    private Map<Lead.LeadStatus, Long> leadsByStatus;

    private Map<Lead.LeadPriority, Long> leadsByPriority;
}
