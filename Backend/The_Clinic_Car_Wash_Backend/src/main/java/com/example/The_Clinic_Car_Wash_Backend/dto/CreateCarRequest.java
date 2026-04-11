package com.example.The_Clinic_Car_Wash_Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateCarRequest {
    @NotBlank(message = "Customer name is required")
    private String customerName;
 
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
 
    @NotBlank(message = "Service type is required")
    @Pattern(regexp = "basic|deluxe", message = "Service type must be 'basic' or 'deluxe'")
    private String serviceType;
 
    private String licensePlate = "";
}
