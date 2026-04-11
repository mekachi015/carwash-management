package com.example.The_Clinic_Car_Wash_Backend.service;

import java.time.Duration;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.The_Clinic_Car_Wash_Backend.dto.StatsResponse;
import com.example.The_Clinic_Car_Wash_Backend.entity.Car;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StatsService {
    private final CarService     carService;
    private final PaymentService paymentService;
    private final QueueService   queueService;
 
    /**
     * Builds the full today's stats response for the owner dashboard.
     */
    public StatsResponse getTodayStats() {
 
        List<Car> doneCars  = carService.getTodayDoneCars();
        double    revenue   = paymentService.getTodayRevenue();
        int       queueLen  = carService.getQueue().getTotalWaiting();
        Double    avgWait   = calcAvgWait(doneCars);
 
        System.out.println("─".repeat(55));
        System.out.println("  📋 [StatsService] Today's Stats");
        System.out.printf("  Revenue     : $%.0f%n", revenue);
        System.out.printf("  Cars Washed : %d%n", doneCars.size());
        System.out.printf("  Avg Wait    : %s min%n", avgWait != null ? avgWait : "N/A");
        System.out.printf("  In Queue    : %d%n", queueLen);
        System.out.println("─".repeat(55));
 
        return StatsResponse.builder()
                .todayRevenue(revenue)
                .carsWashed(doneCars.size())
                .avgWaitMins(avgWait)
                .queueLength(queueLen)
                .build();
    }
 
    /**
     * Calculates average minutes from arrival to completion
     * for all cars that completed today.
     * Returns null if no cars have completed yet.
     */
    private Double calcAvgWait(List<Car> doneCars) {
        List<Long> durations = doneCars.stream()
                .filter(c -> c.getArrivalTime() != null && c.getCompletionTime() != null)
                .map(c -> Duration.between(c.getArrivalTime(), c.getCompletionTime()).getSeconds())
                .toList();
 
        return queueService.calcAvgWaitMinutes(durations);
    }
}
