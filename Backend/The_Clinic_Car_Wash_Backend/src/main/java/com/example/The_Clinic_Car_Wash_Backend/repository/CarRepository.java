package com.example.The_Clinic_Car_Wash_Backend.repository;

import org.springframework.stereotype.Repository;

import com.example.The_Clinic_Car_Wash_Backend.entity.Car;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.WashStatus;

import org.springframework.data.mongodb.repository.MongoRepository;

 
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarRepository extends MongoRepository<Car, String> {
 List<Car> findByStatusNotOrderByArrivalTimeAsc(WashStatus status);

 Optional<Car> findByPhoneNumberAndStatusNot(String phoneNumber, WashStatus status);

 Optional<Car> findByPhoneNumber(String phoneNumber);

 List<Car> findByArrivalTimeAfter(LocalDateTime since);

 List<Car> findByStatusAndArrivalTimeAfter(WashStatus status, LocalDateTime since);
}
