package com.example.The_Clinic_Car_Wash_Backend.entity;

import java.time.LocalDateTime;

import com.example.The_Clinic_Car_Wash_Backend.enumarated.NotificationStatus;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.NotificationType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_logs")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;          // WASHING, DONE, PAYMENT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;     // SENT, FAILED

    private String twilioMessageSid;       // returned by Twilio on success
    private String errorMessage;           // populated on failure

    @Column(nullable = false)
    private LocalDateTime sentAt;
}
