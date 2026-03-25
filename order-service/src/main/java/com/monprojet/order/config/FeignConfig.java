package com.monprojet.order.config;

import com.monprojet.order.security.RoleGuard;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                // Ajouter automatiquement le header X-ROLE avec la valeur ADMIN
                // pour les appels inter-services
                template.header(RoleGuard.HEADER_NAME, "ADMIN");
            }
        };
    }
}
