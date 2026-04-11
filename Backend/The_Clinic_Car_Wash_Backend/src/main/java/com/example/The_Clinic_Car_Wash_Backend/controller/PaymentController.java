package com.example.The_Clinic_Car_Wash_Backend.controller;

import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.The_Clinic_Car_Wash_Backend.dto.PaymentRequest;
import com.example.The_Clinic_Car_Wash_Backend.entity.Payment;
import com.example.The_Clinic_Car_Wash_Backend.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    @Autowired
    private PaymentService paymentService;
 
    // POST /api/payments/{carId}
    @PostMapping("/{carId}")
    public ResponseEntity<?> processPayment(
            @PathVariable String carId,
            @Valid @RequestBody PaymentRequest request) {
 
        System.out.printf("[PaymentController] POST /api/payments/%s — card: ****%s%n",
                carId, request.getCardLast4());
        try {
            Payment payment = paymentService.processPayment(carId, request.getCardLast4());
            return ResponseEntity.status(HttpStatus.CREATED).body(payment);
        } catch (NoSuchElementException e) {
            System.out.println("[PaymentController] ❌ Car not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            System.out.println("[PaymentController] ❌ Already paid: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
