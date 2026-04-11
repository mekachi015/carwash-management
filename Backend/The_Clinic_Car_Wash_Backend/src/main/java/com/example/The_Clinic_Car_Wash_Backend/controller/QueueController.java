package com.example.The_Clinic_Car_Wash_Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.The_Clinic_Car_Wash_Backend.dto.QueueResponse;
import com.example.The_Clinic_Car_Wash_Backend.service.CarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {
    @Autowired
    private CarService carService;
 
    // GET /api/queue
    @GetMapping
    public ResponseEntity<QueueResponse> getQueue() {
        System.out.println("[QueueController] GET /api/queue");
        QueueResponse response = carService.getQueue();
        System.out.printf("[QueueController] ✅ Returning queue — %d car(s) waiting%n",
                response.getTotalWaiting());
        return ResponseEntity.ok(response);
    }
}
