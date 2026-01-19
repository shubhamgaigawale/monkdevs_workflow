package com.crm.campaignservice.service;

import com.crm.campaignservice.dto.request.CreateCampaignRequest;
import com.crm.campaignservice.dto.request.UpdateCampaignRequest;
import com.crm.campaignservice.dto.response.CampaignDTO;
import com.crm.campaignservice.dto.response.CampaignStatsDTO;
import com.crm.campaignservice.entity.Campaign;
import com.crm.campaignservice.entity.CampaignRecipient;
import com.crm.campaignservice.repository.CampaignRepository;
import com.crm.campaignservice.repository.CampaignRecipientRepository;
import com.crm.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final MailchimpService mailchimpService;

    /**
     * Create a new campaign
     */
    public CampaignDTO createCampaign(CreateCampaignRequest request, UUID tenantId, UUID userId) {
        log.info("Creating campaign: {} for tenant: {}", request.getName(), tenantId);

        Campaign campaign = new Campaign();
        campaign.setTenantId(tenantId);
        campaign.setUserId(userId);
        campaign.setName(request.getName());
        campaign.setSubject(request.getSubject());
        campaign.setPreviewText(request.getPreviewText());
        campaign.setFromName(request.getFromName());
        campaign.setReplyTo(request.getReplyTo());
        campaign.setCampaignType(request.getCampaignType());
        campaign.setScheduledAt(request.getScheduledAt());
        campaign.setContent(request.getContent());
        campaign.setMetadata(request.getMetadata());
        campaign.setStatus(Campaign.CampaignStatus.DRAFT);
        campaign.setTotalRecipients(request.getLeadIds().size());

        campaign = campaignRepository.save(campaign);

        // Create recipient records
        for (UUID leadId : request.getLeadIds()) {
            createRecipient(campaign.getId(), leadId, tenantId);
        }

        log.info("Campaign created successfully: {}", campaign.getId());
        return convertToDTO(campaign);
    }

    /**
     * Get campaign by ID
     */
    @Transactional(readOnly = true)
    public CampaignDTO getCampaign(UUID campaignId, UUID tenantId) {
        Campaign campaign = campaignRepository.findByTenantIdAndId(tenantId, campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        return convertToDTO(campaign);
    }

    /**
     * Update campaign
     */
    public CampaignDTO updateCampaign(UUID campaignId, UpdateCampaignRequest request, UUID tenantId) {
        log.info("Updating campaign: {}", campaignId);

        Campaign campaign = campaignRepository.findByTenantIdAndId(tenantId, campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        if (campaign.getStatus() != Campaign.CampaignStatus.DRAFT) {
            throw new IllegalStateException("Can only update draft campaigns");
        }

        if (request.getName() != null) campaign.setName(request.getName());
        if (request.getSubject() != null) campaign.setSubject(request.getSubject());
        if (request.getPreviewText() != null) campaign.setPreviewText(request.getPreviewText());
        if (request.getFromName() != null) campaign.setFromName(request.getFromName());
        if (request.getReplyTo() != null) campaign.setReplyTo(request.getReplyTo());
        if (request.getScheduledAt() != null) campaign.setScheduledAt(request.getScheduledAt());
        if (request.getContent() != null) campaign.setContent(request.getContent());
        if (request.getMetadata() != null) campaign.setMetadata(request.getMetadata());

        campaign = campaignRepository.save(campaign);
        log.info("Campaign updated successfully: {}", campaignId);

        return convertToDTO(campaign);
    }

    /**
     * Get all campaigns for tenant
     */
    @Transactional(readOnly = true)
    public Page<CampaignDTO> getAllCampaigns(UUID tenantId, UUID userId, List<String> roles, int page, int size) {
        log.info("Fetching campaigns for tenant: {}", tenantId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Campaign> campaigns;

        if (roles.contains("AGENT")) {
            campaigns = campaignRepository.findByTenantIdAndUserIdOrderByCreatedAtDesc(tenantId, userId, pageable);
        } else {
            campaigns = campaignRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        }

        return campaigns.map(this::convertToDTO);
    }

    /**
     * Send campaign
     */
    public CampaignDTO sendCampaign(UUID campaignId, UUID tenantId) {
        log.info("Sending campaign: {}", campaignId);

        Campaign campaign = campaignRepository.findByTenantIdAndId(tenantId, campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        if (campaign.getStatus() != Campaign.CampaignStatus.DRAFT &&
            campaign.getStatus() != Campaign.CampaignStatus.SCHEDULED) {
            throw new IllegalStateException("Campaign already sent or cannot be sent");
        }

        // Send via Mailchimp
        try {
            String mailchimpCampaignId = mailchimpService.sendCampaign(campaign);
            campaign.setMailchimpCampaignId(mailchimpCampaignId);
            campaign.setStatus(Campaign.CampaignStatus.SENT);
            campaign.setSentAt(LocalDateTime.now());

            campaign = campaignRepository.save(campaign);
            log.info("Campaign sent successfully: {}", campaignId);
        } catch (Exception e) {
            log.error("Failed to send campaign: {}", campaignId, e);
            throw new RuntimeException("Failed to send campaign: " + e.getMessage());
        }

        return convertToDTO(campaign);
    }

    /**
     * Schedule campaign
     */
    public CampaignDTO scheduleCampaign(UUID campaignId, LocalDateTime scheduledAt, UUID tenantId) {
        log.info("Scheduling campaign: {} for {}", campaignId, scheduledAt);

        Campaign campaign = campaignRepository.findByTenantIdAndId(tenantId, campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        if (campaign.getStatus() != Campaign.CampaignStatus.DRAFT) {
            throw new IllegalStateException("Can only schedule draft campaigns");
        }

        campaign.setScheduledAt(scheduledAt);
        campaign.setStatus(Campaign.CampaignStatus.SCHEDULED);
        campaign = campaignRepository.save(campaign);

        log.info("Campaign scheduled successfully: {}", campaignId);
        return convertToDTO(campaign);
    }

    /**
     * Cancel campaign
     */
    public void cancelCampaign(UUID campaignId, UUID tenantId) {
        log.info("Cancelling campaign: {}", campaignId);

        Campaign campaign = campaignRepository.findByTenantIdAndId(tenantId, campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        if (campaign.getStatus() == Campaign.CampaignStatus.SENT) {
            throw new IllegalStateException("Cannot cancel already sent campaign");
        }

        campaign.setStatus(Campaign.CampaignStatus.CANCELLED);
        campaignRepository.save(campaign);

        log.info("Campaign cancelled successfully: {}", campaignId);
    }

    /**
     * Get campaign statistics
     */
    @Transactional(readOnly = true)
    public CampaignStatsDTO getCampaignStats(UUID tenantId) {
        log.info("Fetching campaign statistics for tenant: {}", tenantId);

        Long totalCampaigns = campaignRepository.count();
        Long draftCampaigns = campaignRepository.countByTenantIdAndStatus(tenantId, Campaign.CampaignStatus.DRAFT);
        Long scheduledCampaigns = campaignRepository.countByTenantIdAndStatus(tenantId, Campaign.CampaignStatus.SCHEDULED);
        Long sentCampaigns = campaignRepository.countByTenantIdAndStatus(tenantId, Campaign.CampaignStatus.SENT);

        List<Campaign> sentCampaignList = campaignRepository.findByTenantIdAndStatus(tenantId, Campaign.CampaignStatus.SENT);

        int totalRecipients = sentCampaignList.stream().mapToInt(c -> c.getTotalRecipients()).sum();
        int totalEmailsSent = sentCampaignList.stream().mapToInt(c -> c.getEmailsSent()).sum();
        int totalOpens = sentCampaignList.stream().mapToInt(c -> c.getOpens()).sum();
        int totalClicks = sentCampaignList.stream().mapToInt(c -> c.getClicks()).sum();

        double averageOpenRate = totalEmailsSent > 0 ? (double) totalOpens / totalEmailsSent * 100 : 0;
        double averageClickRate = totalEmailsSent > 0 ? (double) totalClicks / totalEmailsSent * 100 : 0;

        return CampaignStatsDTO.builder()
                .totalCampaigns(totalCampaigns)
                .draftCampaigns(draftCampaigns)
                .scheduledCampaigns(scheduledCampaigns)
                .sentCampaigns(sentCampaigns)
                .totalRecipients(totalRecipients)
                .totalEmailsSent(totalEmailsSent)
                .totalOpens(totalOpens)
                .totalClicks(totalClicks)
                .averageOpenRate(averageOpenRate)
                .averageClickRate(averageClickRate)
                .build();
    }

    /**
     * Create recipient record
     */
    private void createRecipient(UUID campaignId, UUID leadId, UUID tenantId) {
        // In a real implementation, fetch lead details from Lead Service
        // For now, create a placeholder recipient

        CampaignRecipient recipient = new CampaignRecipient();
        recipient.setTenantId(tenantId);
        recipient.setCampaignId(campaignId);
        recipient.setLeadId(leadId);
        recipient.setEmail("placeholder@example.com"); // Would fetch from Lead Service
        recipient.setStatus(CampaignRecipient.RecipientStatus.PENDING);

        recipientRepository.save(recipient);
    }

    /**
     * Convert to DTO
     */
    private CampaignDTO convertToDTO(Campaign campaign) {
        double openRate = campaign.getEmailsSent() > 0 ?
                (double) campaign.getUniqueOpens() / campaign.getEmailsSent() * 100 : 0;
        double clickRate = campaign.getEmailsSent() > 0 ?
                (double) campaign.getUniqueClicks() / campaign.getEmailsSent() * 100 : 0;
        double bounceRate = campaign.getEmailsSent() > 0 ?
                (double) campaign.getBounces() / campaign.getEmailsSent() * 100 : 0;
        double unsubscribeRate = campaign.getEmailsSent() > 0 ?
                (double) campaign.getUnsubscribes() / campaign.getEmailsSent() * 100 : 0;

        return CampaignDTO.builder()
                .id(campaign.getId())
                .tenantId(campaign.getTenantId())
                .userId(campaign.getUserId())
                .name(campaign.getName())
                .subject(campaign.getSubject())
                .previewText(campaign.getPreviewText())
                .fromName(campaign.getFromName())
                .replyTo(campaign.getReplyTo())
                .status(campaign.getStatus())
                .campaignType(campaign.getCampaignType())
                .mailchimpCampaignId(campaign.getMailchimpCampaignId())
                .scheduledAt(campaign.getScheduledAt())
                .sentAt(campaign.getSentAt())
                .totalRecipients(campaign.getTotalRecipients())
                .emailsSent(campaign.getEmailsSent())
                .opens(campaign.getOpens())
                .uniqueOpens(campaign.getUniqueOpens())
                .clicks(campaign.getClicks())
                .uniqueClicks(campaign.getUniqueClicks())
                .bounces(campaign.getBounces())
                .unsubscribes(campaign.getUnsubscribes())
                .content(campaign.getContent())
                .metadata(campaign.getMetadata())
                .createdAt(campaign.getCreatedAt())
                .updatedAt(campaign.getUpdatedAt())
                .openRate(openRate)
                .clickRate(clickRate)
                .bounceRate(bounceRate)
                .unsubscribeRate(unsubscribeRate)
                .build();
    }
}
