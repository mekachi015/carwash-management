package com.example.The_Clinic_Car_Wash_Backend.dto.PaymentDTO;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class InitiatePaymentResponse {

    private String redirectUrl;

    private String paymentToken;

    private double amount;

    private String customerName;

    private String payfastUrl;

    private java.util.LinkedHashMap<String, String> payfastParams;

}
