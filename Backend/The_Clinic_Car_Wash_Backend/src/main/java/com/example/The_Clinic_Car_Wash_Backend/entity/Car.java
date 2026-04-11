package com.example.The_Clinic_Car_Wash_Backend.entity;

import java.time.LocalDateTime;

//

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.example.The_Clinic_Car_Wash_Backend.enumarated.WashStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cars")
public class Car {

    @Id
    private String id;
 
    @Field("name")
    private String customerName;
 
    @Indexed                        // index for fast phone lookups
    @Field("phone")
    private String phoneNumber;
 
    /** "basic" ($10) or "deluxe" ($20) */
    private String serviceType;
 
    private String licensePlate;
 
    /** Waiting → Washing → Rinsing → Drying → Done */
    @Builder.Default
    private WashStatus status = WashStatus.WAITING;
 
    @Builder.Default
    private boolean paid = false;
 
    @Builder.Default
    private LocalDateTime arrivalTime = LocalDateTime.now();
 
    private LocalDateTime completionTime;
 
 
    // ── Convenience methods ──────────────────────────────────────────────────
 
    public boolean isActive() {
        return this.status != WashStatus.DONE;
    }
 
    public int getServicePrice() {
        return "deluxe".equalsIgnoreCase(this.serviceType) ? 20 : 10;
    }
}
