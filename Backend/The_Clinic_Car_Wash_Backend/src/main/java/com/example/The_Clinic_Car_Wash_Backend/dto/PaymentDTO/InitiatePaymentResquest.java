package com.example.The_Clinic_Car_Wash_Backend.dto.PaymentDTO;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class InitiatePaymentResquest {

    private String carId;

    private String customerEmail;
}
