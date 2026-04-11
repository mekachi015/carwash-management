package com.example.The_Clinic_Car_Wash_Backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.The_Clinic_Car_Wash_Backend.dto.RevenueByDayResponse;
import com.example.The_Clinic_Car_Wash_Backend.entity.Car;
import com.example.The_Clinic_Car_Wash_Backend.entity.Payment;
import com.example.The_Clinic_Car_Wash_Backend.repository.CarRepository;
import com.example.The_Clinic_Car_Wash_Backend.repository.PaymentRepository;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private  CarRepository carRepository;
    
    @Autowired
    private NotificationService notificationService;
 
    private static final DateTimeFormatter DATE_FMT  = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter LABEL_FMT = DateTimeFormatter.ofPattern("MMM dd");
 
    /**
     * Processes a payment for a car.
     * Marks the car as paid and sends a WhatsApp confirmation.
     *
     * @throws NoSuchElementException  if the car does not exist
     * @throws IllegalStateException   if the car has already been paid for
     */
    public Payment processPayment(String carId, String cardLast4) {
 
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new NoSuchElementException("Car not found with id: " + carId));
 
        if (car.isPaid()) {
            throw new IllegalStateException("Car " + carId + " has already been paid for.");
        }
 
        double amount = car.getServicePrice();
 
        System.out.println("─".repeat(55));
        System.out.println("  💳 [PaymentService] Processing payment...");
        System.out.printf("  Car ID    : %s%n", carId);
        System.out.printf("  Customer  : %s%n", car.getCustomerName());
        System.out.printf("  Service   : %s%n", car.getServiceType());
        System.out.printf("  Amount    : $%.0f%n", amount);
        System.out.printf("  Card      : **** **** **** %s%n", cardLast4);
        System.out.println("─".repeat(55));
 
        // Record the payment
        Payment payment = Payment.builder()
                .carId(carId)
                .customerName(car.getCustomerName())
                .amount(amount)
                .cardLast4(cardLast4)
                .build();
 
        Payment saved = paymentRepository.save(payment);
 
        // Mark the car as paid
        car.setPaid(true);
        carRepository.save(car);
 
        System.out.printf("[PaymentService] ✅ Payment saved — ID: %s | Amount: $%.0f%n",
                saved.getId(), saved.getAmount());
 
        // Send WhatsApp confirmation
        notificationService.notifyPaymentConfirmed(
                car.getPhoneNumber(),
                car.getCustomerName(),
                amount
        );
 
        return saved;
    }
 
    /**
     * Returns the total revenue collected today (UTC midnight onwards).
     */
    public double getTodayRevenue() {
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIDNIGHT);
        List<Payment> payments   = paymentRepository.findByPaidAtAfter(startOfDay);
        double total = payments.stream().mapToDouble(Payment::getAmount).sum();
        System.out.printf("[PaymentService] 📊 Today's revenue: $%.0f (%d payments)%n",
                total, payments.size());
        return total;
    }
 
    /**
     * Returns daily revenue totals for the last N days.
     * Used to populate the bar chart on the owner dashboard.
     */
    public List<RevenueByDayResponse> getRevenueByDay(int days) {
        List<RevenueByDayResponse> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
 
        for (int i = days - 1; i >= 0; i--) {
            LocalDate    day      = today.minusDays(i);
            LocalDateTime start   = day.atStartOfDay();
            LocalDateTime end     = day.atTime(LocalTime.MAX);
 
            List<Payment> payments = paymentRepository.findByPaidAtAfter(start)
                    .stream()
                    .filter(p -> p.getPaidAt().isBefore(end))
                    .toList();
 
            double revenue = payments.stream().mapToDouble(Payment::getAmount).sum();
 
            result.add(RevenueByDayResponse.builder()
                    .date(day.format(DATE_FMT))
                    .label(i == 0 ? "Today" : day.format(LABEL_FMT))
                    .revenue(revenue)
                    .build());
        }
 
        System.out.printf("[PaymentService] 📈 Revenue chart built for last %d days%n", days);
        return result;
    }
}
