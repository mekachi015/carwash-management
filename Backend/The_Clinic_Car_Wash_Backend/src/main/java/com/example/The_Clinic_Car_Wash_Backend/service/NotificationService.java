package com.example.The_Clinic_Car_Wash_Backend.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.The_Clinic_Car_Wash_Backend.config.TwilioConfig;
import com.example.The_Clinic_Car_Wash_Backend.entity.NotificationLog;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.NotificationStatus;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.NotificationType;
import com.example.The_Clinic_Car_Wash_Backend.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import com.twilio.rest.api.v2010.account.Message;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private static final String DIVIDER = "─".repeat(55);

    @Autowired
    private TwilioConfig twilioConfig;

    @Autowired
    private NotificationRepository notificationRepository;
 
    /**
     * Fired when a car's status changes to WASHING.
     */
    public void notifyWashing(String phoneNumber, String customerName) {
        String message = String.format(
            "Hi %s! Your car is now being washed. Ready in ~5 minutes. 🚿",
            customerName
        );
        send(phoneNumber, customerName, message, NotificationType.WASHING);
    }
 
    /**
     * Fired when a car's status changes to DONE.
     */
    public void notifyDone(String phoneNumber, String customerName) {
        String message = String.format(
            "Hi %s! Your car is ready for collection. Please come to the front. 🚗✨",
            customerName
        );
        send(phoneNumber, customerName, message, NotificationType.DONE);
    }
 
    /**
     * Fired when a payment is successfully processed.
     */
    public void notifyPaymentConfirmed(String phoneNumber, String customerName, double amount) {
        String message = String.format(
            "Hi %s! Payment of R%.0f received. Thank you for using The Clinic Car Wash! 🧾",
            customerName, amount
        );
        send(phoneNumber, customerName, message, NotificationType.PAYMENT);
    }
 
    // ── Private helpers ──────────────────────────────────────────────────────
 
    private void send(String phoneNumber, String customerName,
                      String message, NotificationType type) {

        NotificationLog.NotificationLogBuilder logBuilder = NotificationLog.builder()
            .phoneNumber(phoneNumber)
            .customerName(customerName)
            .message(message)
            .type(type)
            .sentAt(LocalDateTime.now());

        try {
            // Phone must be in E.164 format: +27XXXXXXXXX
            Message twilioMsg = Message.creator(
                new PhoneNumber("whatsapp:" + phoneNumber),
                new PhoneNumber(twilioConfig.getWhatsappFrom()),
                message
            ).create();

            notificationRepository.save(
                logBuilder
                    .status(NotificationStatus.SENT)
                    .twilioMessageSid(twilioMsg.getSid())
                    .build()
            );

            log.info("WhatsApp sent to {} | SID: {}", phoneNumber, twilioMsg.getSid());

        } catch (Exception ex) {
            notificationRepository.save(
                logBuilder
                    .status(NotificationStatus.FAILED)
                    .errorMessage(ex.getMessage())
                    .build()
            );
            log.error("WhatsApp failed for {} | Reason: {}", phoneNumber, ex.getMessage());
        }
    }
}
