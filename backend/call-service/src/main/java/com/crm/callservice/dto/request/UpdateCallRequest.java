package com.crm.callservice.dto.request;

import com.crm.callservice.entity.Call;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCallRequest {

    private UUID leadId;

    private Call.CallStatus status;

    private Integer duration;

    private LocalDateTime callEndTime;

    private String notes;

    private String outcome;

    private Boolean followUpRequired;

    private LocalDateTime followUpDate;

    private String recordingUrl;

    private Map<String, Object> callMetadata;
}
