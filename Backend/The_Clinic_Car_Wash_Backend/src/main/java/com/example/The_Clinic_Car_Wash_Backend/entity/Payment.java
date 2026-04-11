package com.example.The_Clinic_Car_Wash_Backend.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {
    @Id
    private String id;
 
    private String carId;
 
    private String customerName;
 
    private double amount;
 
    /** Last 4 digits of the card used — never store full card numbers */
    private String cardLast4;
 
    @Builder.Default
    private LocalDateTime paidAt = LocalDateTime.now();
}
