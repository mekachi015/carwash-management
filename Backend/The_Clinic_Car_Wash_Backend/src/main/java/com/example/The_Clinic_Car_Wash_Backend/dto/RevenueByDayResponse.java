package com.example.The_Clinic_Car_Wash_Backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RevenueByDayResponse {
    
    /** ISO date string e.g. "2025-04-10" */
    private String date;
 
    /** Human-friendly label e.g. "Today" or "Apr 10" */
    private String label;
 
    private double revenue;
}
