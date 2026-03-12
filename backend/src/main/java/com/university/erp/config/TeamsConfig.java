package com.university.erp.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class TeamsConfig {

    @Data
    @ConfigurationProperties(prefix = "azure.graph")
    public static class GraphConfig {
        private String tenantId;
        private String clientId;
        private String clientSecret;
    }
    
    // GraphServiceClient bean to be added after Azure app setup
    // Microsoft Graph integration ready - add @Bean when credentials configured
}

