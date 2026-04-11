package com.example.The_Clinic_Car_Wash_Backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
 
import java.util.List;

@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
 
        // Allow the React dev server and any other local origins
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000"
        ));
 
        // Allow all standard HTTP methods including OPTIONS (preflight)
        config.setAllowedMethods(List.of(
            "GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"
        ));
 
        // Allow all headers the browser might send
        config.setAllowedHeaders(List.of("*"));
 
        // Allow cookies/auth headers if needed later
        config.setAllowCredentials(true);
 
        // Cache preflight response for 1 hour — reduces OPTIONS requests
        config.setMaxAge(3600L);
 
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
 
        // Apply to every endpoint
        source.registerCorsConfiguration("/**", config);
 
        System.out.println("[CorsConfig] ✅ CORS filter registered for http://localhost:5173");
 
        return new CorsFilter(source);
    }
}
