package com.example.The_Clinic_Car_Wash_Backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.The_Clinic_Car_Wash_Backend.dto.PaymentRequest;
import com.example.The_Clinic_Car_Wash_Backend.dto.RevenueByDayResponse;
import com.example.The_Clinic_Car_Wash_Backend.dto.PaymentDTO.InitiatePaymentResponse;
import com.example.The_Clinic_Car_Wash_Backend.dto.PaymentDTO.InitiatePaymentResquest;
import com.example.The_Clinic_Car_Wash_Backend.dto.PaymentDTO.PaymentStatusResponse;
import com.example.The_Clinic_Car_Wash_Backend.entity.Payment;
import com.example.The_Clinic_Car_Wash_Backend.service.PaymentService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
   @Autowired
    private PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody InitiatePaymentResquest request) {
        try {
            System.out.printf("[PaymentController] POST /initiate — carId: %s%n", request.getCarId());
            InitiatePaymentResponse response = paymentService.initiatePayment(request);
            // 201 Created is semantically better for creating a new payment resource
            return ResponseEntity.status(201).body(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred"));
        }
    }

    @PostMapping("/payfast/notify")
public ResponseEntity<String> handlePayFastItn(HttpServletRequest request) {
    try {
        String rawBody = request.getReader().lines()
                .collect(java.util.stream.Collectors.joining());

        System.out.println("[PaymentController] ITN raw body: " + rawBody);

        // Parse into LinkedHashMap preserving order
        Map<String, String> params = new java.util.LinkedHashMap<>();
        for (String pair : rawBody.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                params.put(
                    java.net.URLDecoder.decode(kv[0], java.nio.charset.StandardCharsets.UTF_8),
                    java.net.URLDecoder.decode(kv[1], java.nio.charset.StandardCharsets.UTF_8)
                );
            }
        }

        paymentService.handleItn(params, rawBody); // ← pass rawBody too
        return ResponseEntity.ok("OK");
    } catch (Exception e) {
        System.err.println("[PaymentController] ITN Error: " + e.getMessage());
        return ResponseEntity.ok("OK");
    }
}

    @GetMapping("/{paymentToken}/status")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String paymentToken) {
        try {
            PaymentStatusResponse response = paymentService.getPaymentStatus(paymentToken);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            // 404 if the token is invalid or doesn't exist
            return ResponseEntity.status(404).body(Map.of("error", "Payment token not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Server error retrieving status"));
        }
    }

    @GetMapping("/revenue/today")
    public ResponseEntity<?> getTodayRevenue() {
        try {
            double revenue = paymentService.getTodayRevenue();
            return ResponseEntity.ok(Map.of("revenue", revenue));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Could not calculate revenue"));
        }
    }

    @GetMapping("/revenue/chart")
    public ResponseEntity<?> getRevenueChart(@RequestParam(defaultValue = "7") int days) {
        try {
            List<RevenueByDayResponse> chartData = paymentService.getRevenueByDay(days);
            return ResponseEntity.ok(chartData);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid number of days"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to load chart data"));
        }
    }
}
