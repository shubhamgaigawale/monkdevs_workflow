package com.crm.callservice.dto.response;

import com.crm.callservice.entity.Call;
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
public class CallDTO {

    private UUID id;

    private UUID tenantId;

    private UUID leadId;

    private String leadName;

    private UUID userId;

    private String userName;

    private String phoneNumber;

    private Call.CallDirection direction;

    private Call.CallStatus status;

    private Integer duration;

    private LocalDateTime callStartTime;

    private LocalDateTime callEndTime;

    private String recordingUrl;

    private String notes;

    private String outcome;

    private Boolean followUpRequired;

    private LocalDateTime followUpDate;

    private String externalCallId;

    private Map<String, Object> callMetadata;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
