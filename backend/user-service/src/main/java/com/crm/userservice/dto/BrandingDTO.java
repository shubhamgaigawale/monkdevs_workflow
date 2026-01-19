package com.crm.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for tenant branding information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandingDTO {
    private UUID tenantId;
    private String portalName;
    private String logoUrl;
    private String faviconUrl;
    private String primaryColor;
    private String secondaryColor;
    private String fontFamily;
    private String timezone;
    private String dateFormat;
    private String timeFormat;
    private String currency;
}
