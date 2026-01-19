package com.crm.campaignservice.service;

import com.crm.campaignservice.entity.Campaign;
import com.crm.campaignservice.entity.CampaignRecipient;
import com.crm.campaignservice.entity.MailchimpList;
import com.crm.campaignservice.repository.CampaignRecipientRepository;
import com.crm.campaignservice.repository.MailchimpListRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailchimpService {

    private final MailchimpListRepository mailchimpListRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${mailchimp.api-key}")
    private String apiKey;

    @Value("${mailchimp.api-url}")
    private String apiUrl;

    @Value("${mailchimp.default-list-id}")
    private String defaultListId;

    /**
     * Send campaign via Mailchimp
     */
    public String sendCampaign(Campaign campaign) {
        log.info("Sending campaign via Mailchimp: {}", campaign.getId());

        try {
            // Step 1: Get or create list
            String listId = getOrCreateList(campaign.getTenantId());

            // Step 2: Add recipients to list
            addRecipientsToList(campaign.getId(), listId);

            // Step 3: Create Mailchimp campaign
            String mailchimpCampaignId = createMailchimpCampaign(campaign, listId);

            // Step 4: Send campaign
            sendMailchimpCampaign(mailchimpCampaignId);

            return mailchimpCampaignId;

        } catch (Exception e) {
            log.error("Failed to send campaign via Mailchimp: {}", campaign.getId(), e);
            throw new RuntimeException("Mailchimp API error: " + e.getMessage());
        }
    }

    /**
     * Sync campaign statistics from Mailchimp
     */
    public void syncCampaignStats(Campaign campaign) {
        log.info("Syncing campaign stats from Mailchimp: {}", campaign.getMailchimpCampaignId());

        if (campaign.getMailchimpCampaignId() == null) {
            return;
        }

        try {
            String url = apiUrl + "/campaigns/" + campaign.getMailchimpCampaignId() + "/reports";
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> report = response.getBody();

                campaign.setEmailsSent((Integer) report.getOrDefault("emails_sent", 0));
                campaign.setOpens((Integer) report.getOrDefault("opens", 0));
                campaign.setUniqueOpens((Integer) report.getOrDefault("unique_opens", 0));
                campaign.setClicks((Integer) report.getOrDefault("clicks", 0));
                campaign.setUniqueClicks((Integer) report.getOrDefault("unique_clicks", 0));

                Map<String, Object> bounces = (Map<String, Object>) report.getOrDefault("bounces", Map.of());
                campaign.setBounces((Integer) bounces.getOrDefault("hard_bounces", 0) +
                        (Integer) bounces.getOrDefault("soft_bounces", 0));

                campaign.setUnsubscribes((Integer) report.getOrDefault("unsubscribed", 0));

                log.info("Campaign stats synced successfully: {}", campaign.getId());
            }

        } catch (Exception e) {
            log.error("Failed to sync campaign stats: {}", campaign.getId(), e);
        }
    }

    /**
     * Add recipients to Mailchimp list
     */
    public void addRecipientsToList(UUID campaignId, String listId) {
        log.info("Adding recipients to Mailchimp list: {}", listId);

        List<CampaignRecipient> recipients = recipientRepository.findByCampaignIdAndStatus(
                campaignId, CampaignRecipient.RecipientStatus.PENDING);

        for (CampaignRecipient recipient : recipients) {
            try {
                addMemberToList(listId, recipient);
                recipient.setStatus(CampaignRecipient.RecipientStatus.SENT);
                recipientRepository.save(recipient);
            } catch (Exception e) {
                log.error("Failed to add recipient to list: {}", recipient.getEmail(), e);
                recipient.setStatus(CampaignRecipient.RecipientStatus.FAILED);
                recipient.setErrorMessage(e.getMessage());
                recipientRepository.save(recipient);
            }
        }

        log.info("Recipients added to list: {}", listId);
    }

    /**
     * Sync Mailchimp lists
     */
    public void syncLists(UUID tenantId) {
        log.info("Syncing Mailchimp lists for tenant: {}", tenantId);

        try {
            String url = apiUrl + "/lists";
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> lists = (List<Map<String, Object>>) response.getBody().get("lists");

                for (Map<String, Object> listData : lists) {
                    String mailchimpListId = (String) listData.get("id");
                    String name = (String) listData.get("name");

                    MailchimpList list = mailchimpListRepository
                            .findByTenantIdAndMailchimpListId(tenantId, mailchimpListId)
                            .orElse(new MailchimpList());

                    list.setTenantId(tenantId);
                    list.setMailchimpListId(mailchimpListId);
                    list.setName(name);

                    Map<String, Object> stats = (Map<String, Object>) listData.get("stats");
                    list.setTotalSubscribers((Integer) stats.getOrDefault("member_count", 0));
                    list.setLastSyncedAt(LocalDateTime.now());

                    mailchimpListRepository.save(list);
                }

                log.info("Mailchimp lists synced successfully");
            }

        } catch (Exception e) {
            log.error("Failed to sync Mailchimp lists", e);
        }
    }

    /**
     * Get or create Mailchimp list
     */
    private String getOrCreateList(UUID tenantId) {
        Optional<MailchimpList> defaultList = mailchimpListRepository.findByTenantIdAndIsDefaultTrue(tenantId);

        if (defaultList.isPresent()) {
            return defaultList.get().getMailchimpListId();
        }

        // Use configured default list
        return defaultListId;
    }

    /**
     * Create Mailchimp campaign
     */
    private String createMailchimpCampaign(Campaign campaign, String listId) {
        log.info("Creating Mailchimp campaign for: {}", campaign.getId());

        String url = apiUrl + "/campaigns";
        HttpHeaders headers = createHeaders();

        Map<String, Object> campaignData = new HashMap<>();
        campaignData.put("type", "regular");

        Map<String, Object> recipients = new HashMap<>();
        recipients.put("list_id", listId);
        campaignData.put("recipients", recipients);

        Map<String, Object> settings = new HashMap<>();
        settings.put("subject_line", campaign.getSubject());
        settings.put("preview_text", campaign.getPreviewText());
        settings.put("title", campaign.getName());
        settings.put("from_name", campaign.getFromName());
        settings.put("reply_to", campaign.getReplyTo());
        campaignData.put("settings", settings);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(campaignData, headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            String mailchimpCampaignId = (String) response.getBody().get("id");

            // Set campaign content
            setMailchimpCampaignContent(mailchimpCampaignId, campaign.getContent());

            return mailchimpCampaignId;
        }

        throw new RuntimeException("Failed to create Mailchimp campaign");
    }

    /**
     * Set Mailchimp campaign content
     */
    private void setMailchimpCampaignContent(String mailchimpCampaignId, String content) {
        log.info("Setting Mailchimp campaign content: {}", mailchimpCampaignId);

        String url = apiUrl + "/campaigns/" + mailchimpCampaignId + "/content";
        HttpHeaders headers = createHeaders();

        Map<String, Object> contentData = new HashMap<>();
        contentData.put("html", content);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contentData, headers);

        restTemplate.exchange(url, HttpMethod.PUT, entity, Map.class);

        log.info("Mailchimp campaign content set successfully");
    }

    /**
     * Send Mailchimp campaign
     */
    private void sendMailchimpCampaign(String mailchimpCampaignId) {
        log.info("Sending Mailchimp campaign: {}", mailchimpCampaignId);

        String url = apiUrl + "/campaigns/" + mailchimpCampaignId + "/actions/send";
        HttpHeaders headers = createHeaders();

        HttpEntity<String> entity = new HttpEntity<>(headers);

        restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        log.info("Mailchimp campaign sent successfully: {}", mailchimpCampaignId);
    }

    /**
     * Add member to Mailchimp list
     */
    private void addMemberToList(String listId, CampaignRecipient recipient) {
        log.info("Adding member to Mailchimp list: {}", recipient.getEmail());

        String url = apiUrl + "/lists/" + listId + "/members";
        HttpHeaders headers = createHeaders();

        Map<String, Object> memberData = new HashMap<>();
        memberData.put("email_address", recipient.getEmail());
        memberData.put("status", "subscribed");

        Map<String, Object> mergeFields = new HashMap<>();
        mergeFields.put("FNAME", recipient.getFirstName());
        mergeFields.put("LNAME", recipient.getLastName());
        memberData.put("merge_fields", mergeFields);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(memberData, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String memberId = (String) response.getBody().get("id");
                recipient.setMailchimpMemberId(memberId);
            }
        } catch (Exception e) {
            // Member might already exist, try to update
            log.warn("Member already exists, updating: {}", recipient.getEmail());
        }
    }

    /**
     * Create HTTP headers with authentication
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String auth = "anystring:" + apiKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.set("Authorization", "Basic " + encodedAuth);
        return headers;
    }
}
