package com.crm.campaignservice.service;

import com.crm.campaignservice.dto.request.CreateTemplateRequest;
import com.crm.campaignservice.dto.response.CampaignTemplateDTO;
import com.crm.campaignservice.entity.CampaignTemplate;
import com.crm.campaignservice.repository.CampaignTemplateRepository;
import com.crm.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CampaignTemplateService {

    private final CampaignTemplateRepository templateRepository;

    /**
     * Create campaign template
     */
    public CampaignTemplateDTO createTemplate(CreateTemplateRequest request, UUID tenantId) {
        log.info("Creating campaign template: {}", request.getName());

        CampaignTemplate template = new CampaignTemplate();
        template.setTenantId(tenantId);
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setCategory(request.getCategory());
        template.setSubject(request.getSubject());
        template.setPreviewText(request.getPreviewText());
        template.setContent(request.getContent());
        template.setMetadata(request.getMetadata());
        template.setIsActive(true);

        template = templateRepository.save(template);

        log.info("Campaign template created: {}", template.getId());
        return convertToDTO(template);
    }

    /**
     * Get template by ID
     */
    @Transactional(readOnly = true)
    public CampaignTemplateDTO getTemplate(UUID templateId, UUID tenantId) {
        CampaignTemplate template = templateRepository.findByTenantIdAndId(tenantId, templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        return convertToDTO(template);
    }

    /**
     * Get all templates
     */
    @Transactional(readOnly = true)
    public Page<CampaignTemplateDTO> getAllTemplates(UUID tenantId, int page, int size, boolean activeOnly) {
        log.info("Fetching templates for tenant: {}", tenantId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CampaignTemplate> templates;

        if (activeOnly) {
            templates = templateRepository.findByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(tenantId, pageable);
        } else {
            templates = templateRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        }

        return templates.map(this::convertToDTO);
    }

    /**
     * Get templates by category
     */
    @Transactional(readOnly = true)
    public List<CampaignTemplateDTO> getTemplatesByCategory(UUID tenantId, String category) {
        log.info("Fetching templates by category: {}", category);

        List<CampaignTemplate> templates = templateRepository.findByTenantIdAndCategoryAndIsActiveTrue(tenantId, category);

        return templates.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update template
     */
    public CampaignTemplateDTO updateTemplate(UUID templateId, CreateTemplateRequest request, UUID tenantId) {
        log.info("Updating template: {}", templateId);

        CampaignTemplate template = templateRepository.findByTenantIdAndId(tenantId, templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        if (request.getName() != null) template.setName(request.getName());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        if (request.getCategory() != null) template.setCategory(request.getCategory());
        if (request.getSubject() != null) template.setSubject(request.getSubject());
        if (request.getPreviewText() != null) template.setPreviewText(request.getPreviewText());
        if (request.getContent() != null) template.setContent(request.getContent());
        if (request.getMetadata() != null) template.setMetadata(request.getMetadata());

        template = templateRepository.save(template);

        log.info("Template updated: {}", templateId);
        return convertToDTO(template);
    }

    /**
     * Delete template (soft delete by marking inactive)
     */
    public void deleteTemplate(UUID templateId, UUID tenantId) {
        log.info("Deleting template: {}", templateId);

        CampaignTemplate template = templateRepository.findByTenantIdAndId(tenantId, templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        template.setIsActive(false);
        templateRepository.save(template);

        log.info("Template deleted: {}", templateId);
    }

    /**
     * Convert to DTO
     */
    private CampaignTemplateDTO convertToDTO(CampaignTemplate template) {
        return CampaignTemplateDTO.builder()
                .id(template.getId())
                .tenantId(template.getTenantId())
                .name(template.getName())
                .description(template.getDescription())
                .category(template.getCategory())
                .subject(template.getSubject())
                .previewText(template.getPreviewText())
                .content(template.getContent())
                .isActive(template.getIsActive())
                .metadata(template.getMetadata())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
