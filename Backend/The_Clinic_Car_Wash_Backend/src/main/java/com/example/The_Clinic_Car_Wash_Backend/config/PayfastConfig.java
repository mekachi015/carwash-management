package com.example.The_Clinic_Car_Wash_Backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.ConfigurationProperties;


import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "payfast")
public class PayfastConfig {

    private String merchantId; //cling car wash merchant id from the payfast dashboard

    private String merchantKey;

    private String passPhrase;

    private boolean sandbox = true;

    private String notifyUrl;

    private String returnUrl;

    private String cancelUrl;

    public String getBaseUrl(){
        return sandbox
            ? "https://sandbox.payfast.co.za/eng/process"
            : "https://www.payfast.co.za/eng/process";
    }
}
