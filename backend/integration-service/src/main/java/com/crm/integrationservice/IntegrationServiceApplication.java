package com.crm.integrationservice;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {"com.crm.integrationservice", "com.crm.common"})
@EnableJpaAuditing
@OpenAPIDefinition(
        info = @Info(
                title = "Integration Service API",
                version = "1.0",
                description = "Third-party integrations - OAuth2, Calendly, RingCentral, PandaDoc, DocuSign, Mailchimp"
        ),
        servers = {@Server(url = "http://localhost:8086/api")}
)
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class IntegrationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(IntegrationServiceApplication.class, args);
    }
}
