package com.example.The_Clinic_Car_Wash_Backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.The_Clinic_Car_Wash_Backend.entity.NotificationLog;
import com.example.The_Clinic_Car_Wash_Backend.repository.NotificationRepository;
import com.example.The_Clinic_Car_Wash_Backend.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    /** Manually trigger a WASHING notification (useful for testing) */
    @PostMapping("/washing")
    public ResponseEntity<String> sendWashing(@RequestParam String phone,
                                              @RequestParam String name) {
        notificationService.notifyWashing(phone, name);
        return ResponseEntity.ok("Washing notification sent");
    }

    /** Manually trigger a DONE notification */
    @PostMapping("/done")
    public ResponseEntity<String> sendDone(@RequestParam String phone,
                                           @RequestParam String name) {
        notificationService.notifyDone(phone, name);
        return ResponseEntity.ok("Done notification sent");
    }

    /** Manually trigger a PAYMENT notification */
    @PostMapping("/payment")
    public ResponseEntity<String> sendPayment(@RequestParam String phone,
                                              @RequestParam String name,
                                              @RequestParam double amount) {
        notificationService.notifyPaymentConfirmed(phone, name, amount);
        return ResponseEntity.ok("Payment notification sent");
    }

    /** Retrieve all notification logs */
    @GetMapping("/logs")
    public ResponseEntity<List<NotificationLog>> getLogs() {
        return ResponseEntity.ok(notificationRepository.findAll());
    }

    /** Retrieve logs by phone number */
    @GetMapping("/logs/{phone}")
    public ResponseEntity<List<NotificationLog>> getLogsByPhone(
            @PathVariable String phone) {
        return ResponseEntity.ok(notificationRepository.findByPhoneNumber(phone));
    }
}
