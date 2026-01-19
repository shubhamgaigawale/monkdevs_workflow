package com.crm.leadservice.dto.request;

import com.crm.leadservice.entity.Lead;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchLeadRequest {

    private String searchQuery;

    private Lead.LeadStatus status;

    private Lead.LeadPriority priority;

    private String source;

    private Boolean assigned;

    private Integer page = 0;

    private Integer size = 20;
}
