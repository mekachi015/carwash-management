package com.example.The_Clinic_Car_Wash_Backend.dto;

import com.example.The_Clinic_Car_Wash_Backend.enumarated.WashType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCarRequest {
    @NotBlank(message = "Customer name is required")
    private String customerName;
 
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
 
    // @NotBlank(message = "Service type is required")
    // @Pattern(regexp = "basic|deluxe", message = "Service type must be 'basic' or 'deluxe'")
    // private String serviceType;

    @NotNull(message = "Service type is required")
    private WashType serviceType;
    
    private String licensePlate = "";
}
