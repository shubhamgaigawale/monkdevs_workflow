package com.crm.leadservice;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {"com.crm.leadservice", "com.crm.common"})
@EnableJpaAuditing
@OpenAPIDefinition(
        info = @Info(
                title = "Lead Service API",
                version = "1.0",
                description = "Lead management service - CRUD, Excel import, assignment"
        ),
        servers = {@Server(url = "http://localhost:8083/api")}
)
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class LeadServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeadServiceApplication.class, args);
    }
}
