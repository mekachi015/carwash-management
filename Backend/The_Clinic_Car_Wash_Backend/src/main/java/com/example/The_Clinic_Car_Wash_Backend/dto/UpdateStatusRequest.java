package com.example.The_Clinic_Car_Wash_Backend.dto;

import com.example.The_Clinic_Car_Wash_Backend.enumarated.WashStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    @NotNull(message = "Status is required")
    private WashStatus status;
}
