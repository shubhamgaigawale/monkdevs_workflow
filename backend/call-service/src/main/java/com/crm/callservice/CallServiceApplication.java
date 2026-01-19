package com.crm.callservice;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {"com.crm.callservice", "com.crm.common"})
@EnableJpaAuditing
@OpenAPIDefinition(
        info = @Info(
                title = "Call Service API",
                version = "1.0",
                description = "Call logging and management - Inbound/outbound calls, RingCentral integration"
        ),
        servers = {@Server(url = "http://localhost:8084/api")}
)
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class CallServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CallServiceApplication.class, args);
    }
}
