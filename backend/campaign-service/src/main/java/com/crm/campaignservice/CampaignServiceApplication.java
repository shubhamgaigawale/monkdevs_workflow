package com.crm.campaignservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.crm.campaignservice", "com.crm.common"})
public class CampaignServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampaignServiceApplication.class, args);
    }
}
