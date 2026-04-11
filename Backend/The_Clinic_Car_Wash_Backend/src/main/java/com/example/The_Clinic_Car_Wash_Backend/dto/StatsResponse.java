package com.example.The_Clinic_Car_Wash_Backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatsResponse {
    private double todayRevenue;
    private int carsWashed;
 
    /** Average minutes from arrival to completion. Null if no completed cars yet. */
    private Double avgWaitMins;
 
    private int queueLength;
}
