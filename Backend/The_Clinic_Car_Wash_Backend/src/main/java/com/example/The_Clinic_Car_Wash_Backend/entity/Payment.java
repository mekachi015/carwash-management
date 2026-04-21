package com.example.The_Clinic_Car_Wash_Backend.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.example.The_Clinic_Car_Wash_Backend.enumarated.paymentStatus;

import org.springframework.data.mongodb.core.index.Indexed;


import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
//@Document(collection = "payments")
public class Payment {
    @Id
    private String id;
 
    @Indexed
    private String carId;
 
    private String customerName;
 
    private double amount;
 
    /** Last 4 digits of the card used — never store full card numbers */
    private String cardLast4;
 
    @Builder.Default
    private LocalDateTime paidAt = LocalDateTime.now();

    //payfast fields
    @Indexed(unique = true)
    private String paymentToken; //generates with payment request

    private String payfastPaymentId;

    @Builder.Default
    private paymentStatus status = paymentStatus.PENDING;

    private String paymentMethod; // payment method reported for payfast ( cc, eft, wallet )

    @Builder.Default
    private LocalDateTime initiatedAt = LocalDateTime.now();

}
