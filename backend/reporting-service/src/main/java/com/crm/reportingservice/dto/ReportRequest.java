package com.crm.reportingservice.dto;

import com.crm.reportingservice.entity.Report;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ReportRequest {
    private String name;
    private Report.ReportType type;
    private LocalDate startDate;
    private LocalDate endDate;
}
