package com.example.The_Clinic_Car_Wash_Backend.dto;

import java.util.List;

import com.example.The_Clinic_Car_Wash_Backend.entity.Car;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QueueRequest {
    private List<Car> queue;
    private int totalWaiting;
    private int estimatedWaitMins;
    private String suggestedArrival;
 
    /** "green" | "yellow" | "red" based on queue length */
    private String statusColor;
}
