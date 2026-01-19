package com.crm.hrservice;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {"com.crm.hrservice", "com.crm.common"})
@EnableJpaAuditing
@OpenAPIDefinition(
        info = @Info(
                title = "HR Service API",
                version = "1.0",
                description = "HR workflow service - time tracking, attendance, and performance management",
                contact = @Contact(
                        name = "CRM Team",
                        email = "support@crm.local"
                )
        ),
        servers = {
                @Server(url = "http://localhost:8082/api", description = "Local development server")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "JWT token authentication"
)
public class HrServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(HrServiceApplication.class, args);
    }
}
