package com.crm.callservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "calls", schema = "call_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Call extends BaseEntity {

    @Column(name = "lead_id")
    private UUID leadId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", length = 20, nullable = false)
    private CallDirection direction = CallDirection.OUTBOUND;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private CallStatus status = CallStatus.COMPLETED;

    @Column(name = "duration")
    private Integer duration = 0;

    @Column(name = "call_start_time")
    private LocalDateTime callStartTime;

    @Column(name = "call_end_time")
    private LocalDateTime callEndTime;

    @Column(name = "recording_url", length = 500)
    private String recordingUrl;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "outcome", length = 50)
    private String outcome;

    @Column(name = "follow_up_required")
    private Boolean followUpRequired = false;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @Column(name = "external_call_id", length = 100)
    private String externalCallId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "call_metadata", columnDefinition = "jsonb")
    private Map<String, Object> callMetadata;

    public enum CallDirection {
        INBOUND,
        OUTBOUND
    }

    public enum CallStatus {
        COMPLETED,
        MISSED,
        REJECTED,
        FAILED,
        BUSY,
        NO_ANSWER
    }
}
