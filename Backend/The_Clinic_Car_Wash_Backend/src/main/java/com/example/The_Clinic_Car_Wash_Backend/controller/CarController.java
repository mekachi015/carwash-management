package com.example.The_Clinic_Car_Wash_Backend.controller;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.The_Clinic_Car_Wash_Backend.dto.CreateCarRequest;
import com.example.The_Clinic_Car_Wash_Backend.dto.UpdateStatusRequest;
import com.example.The_Clinic_Car_Wash_Backend.entity.Car;
import com.example.The_Clinic_Car_Wash_Backend.service.CarService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {
    @Autowired
    private CarService carService;
 
    // GET /api/cars
    @GetMapping
    public ResponseEntity<List<Car>> getAllCars() {
        System.out.println("[CarController] GET /api/cars");
        return ResponseEntity.ok(carService.getAllCars());
    }
 
    // GET /api/cars/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Car> getCarById(@PathVariable String id) {
        System.out.println("[CarController] GET /api/cars/" + id);
        try {
            return ResponseEntity.ok(carService.getCarById(id));
        } catch (NoSuchElementException e) {
            System.out.println("[CarController] ❌ Not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
 
    // GET /api/cars/by-phone/{phoneNumber}
    @GetMapping("/by-phone/{phoneNumber}")
    public ResponseEntity<Car> getCarByPhone(@PathVariable String phoneNumber) {
        System.out.println("[CarController] GET /api/cars/by-phone/" + phoneNumber);
        try {
            return ResponseEntity.ok(carService.getCarByPhone(phoneNumber));
        } catch (NoSuchElementException e) {
            System.out.println("[CarController] ❌ Not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
 
    // POST /api/cars
    @PostMapping
    public ResponseEntity<?> createCar(@Valid @RequestBody CreateCarRequest request) {
        System.out.printf("[CarController] POST /api/cars — Name: %s | Phone: %s%n",
                request.getCustomerName(), request.getPhoneNumber());
        try {
            Car created = carService.addCar(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException e) {
            System.out.println("[CarController] ❌ Conflict: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
 
    // PATCH /api/cars/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateStatusRequest request) {
 
        System.out.printf("[CarController] PATCH /api/cars/%s/status — newStatus: %s%n",
                id, request.getStatus());
        try {
            Car updated = carService.updateStatus(id, request.getStatus());
            return ResponseEntity.ok(updated);
        } catch (NoSuchElementException e) {
            System.out.println("[CarController] ❌ Not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
 
    // DELETE /api/cars/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable String id) {
        System.out.println("[CarController] DELETE /api/cars/" + id);
        try {
            carService.deleteCar(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            System.out.println("[CarController] ❌ Not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
