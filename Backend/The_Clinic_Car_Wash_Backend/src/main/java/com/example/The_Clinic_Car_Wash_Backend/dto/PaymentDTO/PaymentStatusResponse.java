package com.example.The_Clinic_Car_Wash_Backend.dto.PaymentDTO;

import com.example.The_Clinic_Car_Wash_Backend.enumarated.paymentStatus;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PaymentStatusResponse {
    private String paymentToken;
    private paymentStatus status;           // PENDING / COMPLETE / FAILED / CANCELLED
    private double amount;
    private String customerName;
    private String carId;
    private java.time.LocalDateTime paidAt;
}
