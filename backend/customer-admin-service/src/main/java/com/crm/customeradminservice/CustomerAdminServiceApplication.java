package com.crm.customeradminservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.crm.customeradminservice", "com.crm.common"})
public class CustomerAdminServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CustomerAdminServiceApplication.class, args);
    }
}
