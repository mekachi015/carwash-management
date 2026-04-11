package com.example.The_Clinic_Car_Wash_Backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.The_Clinic_Car_Wash_Backend.dto.RevenueByDayResponse;
import com.example.The_Clinic_Car_Wash_Backend.dto.StatsResponse;
import com.example.The_Clinic_Car_Wash_Backend.service.PaymentService;
import com.example.The_Clinic_Car_Wash_Backend.service.StatsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {
    @Autowired
    private StatsService   statsService;
    
    @Autowired
    private PaymentService paymentService;
 
    // GET /api/stats/today
    @GetMapping("/today")
    public ResponseEntity<StatsResponse> getTodayStats() {
        System.out.println("[StatsController] GET /api/stats/today");
        return ResponseEntity.ok(statsService.getTodayStats());
    }
 
    // GET /api/stats/revenue?days=7
    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueByDayResponse>> getRevenue(
            @RequestParam(defaultValue = "7") int days) {
 
        System.out.printf("[StatsController] GET /api/stats/revenue?days=%d%n", days);
 
        if (days < 1 || days > 30) {
            System.out.println("[StatsController] ❌ Invalid days param: " + days);
            return ResponseEntity.badRequest().build();
        }
 
        return ResponseEntity.ok(paymentService.getRevenueByDay(days));
    }
}
