package com.crm.campaignservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "mailchimp_lists", schema = "campaign_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MailchimpList extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 100)
    private String mailchimpListId;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer totalSubscribers = 0;

    private LocalDateTime lastSyncedAt;

    @Column(nullable = false)
    private Boolean isDefault = false;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata;
}
