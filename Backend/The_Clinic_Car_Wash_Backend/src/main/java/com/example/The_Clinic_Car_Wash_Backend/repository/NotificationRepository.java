package com.example.The_Clinic_Car_Wash_Backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.The_Clinic_Car_Wash_Backend.entity.NotificationLog;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.NotificationStatus;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.NotificationType;

@Repository
public interface NotificationRepository extends MongoRepository<NotificationLog, Long> {
    List<NotificationLog> findByPhoneNumber(String phoneNumber);

    List<NotificationLog> findByType(NotificationType type);

    List<NotificationLog> findByStatus(NotificationStatus status);
}
