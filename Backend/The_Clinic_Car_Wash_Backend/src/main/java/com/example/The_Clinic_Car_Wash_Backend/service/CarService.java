package com.example.The_Clinic_Car_Wash_Backend.service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.The_Clinic_Car_Wash_Backend.dto.CreateCarRequest;
import com.example.The_Clinic_Car_Wash_Backend.dto.QueueResponse;
import com.example.The_Clinic_Car_Wash_Backend.entity.Car;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.WashStatus;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.WashType;
import com.example.The_Clinic_Car_Wash_Backend.repository.CarRepository;

@Service
public class CarService {
    @Autowired
    private CarRepository carRepository;

    @Autowired
    private QueueService queueService;

    @Autowired
    private NotificationService notificationService;

    // ── Queue ────────────────────────────────────────────────────────────────

    /**
     * Returns the full public queue response used by the display page.
     * Cars are already sorted by arrival time via the repository query.
     */
    public QueueResponse getQueue() {
        List<Car> queue = carRepository.findByStatusNotOrderByArrivalTimeAsc(WashStatus.DONE);

        // Attach estimated wait to each car position
        for (int i = 0; i < queue.size(); i++) {
            System.out.printf("[QueueService] Car '%s' at position %d — est. wait: %d min%n",
                    queue.get(i).getCustomerName(), i + 1, queueService.calcWaitMinutes(i));
        }

        int length = queue.size();
        return QueueResponse.builder()
                .queue(queue)
                .totalWaiting(length)
                .estimatedWaitMins(length * 5)
                .suggestedArrival(queueService.getSuggestedArrival(length))
                .statusColor(queueService.getQueueColor(length))
                .build();
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    public Car getCarById(String id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Car not found with id: " + id));
    }

    public Car getCarByPhone(String phoneNumber) {
        return carRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new NoSuchElementException("No car found for phone: " + phoneNumber));
    }

    /**
     * Adds a new car to the queue.
     * Throws IllegalStateException if that phone number already has an active car.
     */
    public Car addCar(CreateCarRequest request) {
        // Duplicate check
        Optional<Car> existing = carRepository.findByPhoneNumberAndStatusNot(
                request.getPhoneNumber(), WashStatus.DONE);
        if (existing.isPresent()) {
            throw new IllegalStateException(
                    "A car with phone number " + request.getPhoneNumber() + " is already in the queue.");
        }

        Car car = Car.builder()
                .customerName(request.getCustomerName())
                .phoneNumber(request.getPhoneNumber())
                .serviceType(WashType.valueOf(request.getServiceType().toUpperCase()))
                .licensePlate(request.getLicensePlate())
                .build();

        Car saved = carRepository.save(car);

        System.out.printf("[CarService] ✅ New car added — Name: %s | Phone: %s | Service: %s | ID: %s%n",
                saved.getCustomerName(), saved.getPhoneNumber(),
                saved.getServiceType(), saved.getId());

        return saved;
    }

    /**
     * Updates a car's wash status.
     * Automatically records completionTime when status becomes DONE.
     * Triggers WhatsApp notifications for WASHING and DONE transitions.
     */
    public Car updateStatus(String id, WashStatus newStatus) {
        Car car = getCarById(id);
        WashStatus oldStatus = car.getStatus();

        car.setStatus(newStatus);

        if (newStatus == WashStatus.DONE) {
            car.setCompletionTime(LocalDateTime.now());
            System.out.printf("[CarService] 🏁 Car '%s' marked as DONE at %s%n",
                    car.getCustomerName(), car.getCompletionTime());
        }

        Car updated = carRepository.save(car);

        System.out.printf("[CarService] 🔄 Status updated — %s: %s → %s%n",
                car.getCustomerName(), oldStatus, newStatus);

        // Trigger notifications for key status changes
        if (newStatus == WashStatus.WASHING) {
            notificationService.notifyWashing(car.getPhoneNumber(), car.getCustomerName());
        }
        if (newStatus == WashStatus.DONE) {
            notificationService.notifyDone(car.getPhoneNumber(), car.getCustomerName());
        }

        return updated;
    }

    public void deleteCar(String id) {
        Car car = getCarById(id);
        carRepository.deleteById(id);
        System.out.printf("[CarService] 🗑️  Car deleted — Name: %s | ID: %s%n",
                car.getCustomerName(), id);
    }

    // ── Stats helpers ────────────────────────────────────────────────────────

    public List<Car> getTodayCars() {
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIDNIGHT);
        return carRepository.findByArrivalTimeAfter(startOfDay);
    }

    public List<Car> getTodayDoneCars() {
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIDNIGHT);
        return carRepository.findByStatusAndArrivalTimeAfter(WashStatus.DONE, startOfDay);
    }
}
