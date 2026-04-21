package com.example.The_Clinic_Car_Wash_Backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.The_Clinic_Car_Wash_Backend.entity.Car;
import com.example.The_Clinic_Car_Wash_Backend.entity.Payment;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.WashStatus;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.paymentStatus;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
 /** Find a payment by our internal token (used to match PayFast ITN callbacks) */
    Optional<Payment> findByPaymentToken(String paymentToken);
 
    /** Find all payments for a specific car */
    List<Payment> findByCarId(String carId);
 
    /** All payments after a given time — used for daily revenue calculation */
    List<Payment> findByPaidAtAfter(LocalDateTime after);
 
    /** All COMPLETE payments after a given time — revenue only counts confirmed payments */
    List<Payment> findByStatusAndPaidAtAfter(paymentStatus status, LocalDateTime after);
 
    /** All payments for the owner history view */
    List<Payment> findAllByOrderByInitiatedAtDesc();
 
    /** Check if a car already has a completed payment */
    boolean existsByCarIdAndStatus(String carId, paymentStatus status);
}
