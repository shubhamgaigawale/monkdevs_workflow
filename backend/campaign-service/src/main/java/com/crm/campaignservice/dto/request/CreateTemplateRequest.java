package com.crm.campaignservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTemplateRequest {

    @NotBlank(message = "Template name is required")
    private String name;

    private String description;

    private String category;

    private String subject;

    private String previewText;

    @NotBlank(message = "Content is required")
    private String content;

    private Map<String, Object> metadata;
}
