package com.example.The_Clinic_Car_Wash_Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotBlank(message = "Card last 4 digits are required")
    @Pattern(regexp = "\\d{4}", message = "cardLast4 must be exactly 4 digits")
    private String cardLast4;
}
