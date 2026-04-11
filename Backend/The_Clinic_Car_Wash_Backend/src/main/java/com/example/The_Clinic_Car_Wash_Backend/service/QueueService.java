package com.example.The_Clinic_Car_Wash_Backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

@Service
public class QueueService {
    private static final int MINS_PER_CAR = 5;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
 
    /**
     * Returns estimated wait in minutes for a car at the given zero-indexed position.
     * Position 0 = currently being served = 0 minutes wait.
     */
    public int calcWaitMinutes(int position) {
        return position * MINS_PER_CAR;
    }
 
    /**
     * Returns a human-readable clock string for when a new customer should arrive.
     * E.g. "Now" or "14:35"
     */
    public String getSuggestedArrival(int queueLength) {
        if (queueLength == 0) {
            return "Now";
        }
        LocalDateTime arrival = LocalDateTime.now().plusMinutes((long) queueLength * MINS_PER_CAR);
        return arrival.format(TIME_FMT);
    }
 
    /**
     * Returns a traffic-light color code based on how busy the queue is.
     *   green  = 0–2 cars
     *   yellow = 3–5 cars
     *   red    = 6+ cars
     */
    public String getQueueColor(int queueLength) {
        if (queueLength <= 2) return "green";
        if (queueLength <= 5) return "yellow";
        return "red";
    }
 
    /**
     * Calculates the average wait in minutes across a list of durations.
     * Returns null if the list is empty.
     */
    public Double calcAvgWaitMinutes(java.util.List<Long> durationsInSeconds) {
        if (durationsInSeconds == null || durationsInSeconds.isEmpty()) return null;
        double avgSeconds = durationsInSeconds.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0);
        return Math.round(avgSeconds / 60.0 * 10.0) / 10.0;
    }
}
