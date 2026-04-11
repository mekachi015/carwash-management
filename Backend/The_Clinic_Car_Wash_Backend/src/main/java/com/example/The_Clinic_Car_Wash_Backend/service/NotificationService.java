package com.example.The_Clinic_Car_Wash_Backend.service;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private static final String DIVIDER = "─".repeat(55);
 
    /**
     * Fired when a car's status changes to WASHING.
     */
    public void notifyWashing(String phoneNumber, String customerName) {
        String message = String.format(
            "Hi %s! Your car is now being washed. Ready in ~5 minutes. 🚿",
            customerName
        );
        printWhatsApp(phoneNumber, message);
    }
 
    /**
     * Fired when a car's status changes to DONE.
     */
    public void notifyDone(String phoneNumber, String customerName) {
        String message = String.format(
            "Hi %s! Your car is ready for collection. Please come to the front. 🚗✨",
            customerName
        );
        printWhatsApp(phoneNumber, message);
    }
 
    /**
     * Fired when a payment is successfully processed.
     */
    public void notifyPaymentConfirmed(String phoneNumber, String customerName, double amount) {
        String message = String.format(
            "Hi %s! Payment of $%.0f received. Thank you for using ShineCo! 🧾",
            customerName, amount
        );
        printWhatsApp(phoneNumber, message);
    }
 
    // ── Private helpers ──────────────────────────────────────────────────────
 
    private void printWhatsApp(String to, String message) {
        System.out.println(DIVIDER);
        System.out.println("  📱 [WhatsApp Notification — SIMULATED]");
        System.out.println("  To      : " + to);
        System.out.println("  Message : " + message);
        System.out.println(DIVIDER);
    }
}
