package com.example.The_Clinic_Car_Wash_Backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.The_Clinic_Car_Wash_Backend.entity.Car;
import com.example.The_Clinic_Car_Wash_Backend.entity.Payment;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.WashStatus;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByCarId(String carId);

    List<Payment> findByPaidAtAfter(LocalDateTime since);
}
