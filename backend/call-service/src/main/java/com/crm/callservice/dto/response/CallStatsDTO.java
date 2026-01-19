package com.crm.callservice.dto.response;

import com.crm.callservice.entity.Call;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CallStatsDTO {

    private Long totalCalls;

    private Long inboundCalls;

    private Long outboundCalls;

    private Integer totalDuration;

    private Integer averageDuration;

    private Map<Call.CallStatus, Long> callsByStatus;

    private Map<Call.CallDirection, Long> callsByDirection;

    private Long callsRequiringFollowUp;
}
