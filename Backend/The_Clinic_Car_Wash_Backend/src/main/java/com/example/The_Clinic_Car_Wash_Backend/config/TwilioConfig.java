package com.example.The_Clinic_Car_Wash_Backend.config;

import org.springframework.context.annotation.Configuration;

import com.twilio.Twilio;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@Getter
public class TwilioConfig {
    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.whatsapp-from}")
    private String whatsappFrom;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }
}
