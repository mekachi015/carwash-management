package com.example.The_Clinic_Car_Wash_Backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.The_Clinic_Car_Wash_Backend.config.PayfastConfig;
import com.example.The_Clinic_Car_Wash_Backend.dto.RevenueByDayResponse;
import com.example.The_Clinic_Car_Wash_Backend.dto.PaymentDTO.InitiatePaymentResponse;
import com.example.The_Clinic_Car_Wash_Backend.dto.PaymentDTO.InitiatePaymentResquest;
import com.example.The_Clinic_Car_Wash_Backend.dto.PaymentDTO.PaymentStatusResponse;
import com.example.The_Clinic_Car_Wash_Backend.entity.Car;
import com.example.The_Clinic_Car_Wash_Backend.entity.Payment;
import com.example.The_Clinic_Car_Wash_Backend.enumarated.paymentStatus;
import com.example.The_Clinic_Car_Wash_Backend.repository.CarRepository;
import com.example.The_Clinic_Car_Wash_Backend.repository.PaymentRepository;
import com.example.The_Clinic_Car_Wash_Backend.utils.PayfastSignatureUtil;

@Service
public class PaymentService {

        @Autowired
        private PaymentRepository paymentRepo;
        @Autowired
        private CarRepository carRepo;
        @Autowired
        private NotificationService notificationService;
        @Autowired
        private PayfastConfig payfastConfig;
        @Autowired
        private PayfastSignatureUtil signatureUtil;

        private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        private static final DateTimeFormatter LABEL_FMT = DateTimeFormatter.ofPattern("MMM dd");

        // ── Initiate payment ─────────────────────────────────────────────────────

        public InitiatePaymentResponse initiatePayment(InitiatePaymentResquest request) {

                Car car = carRepo.findById(request.getCarId())
                                .orElseThrow(() -> new NoSuchElementException(
                                                "Car not found with ID: " + request.getCarId()));

                if (paymentRepo.existsByCarIdAndStatus(car.getId(), paymentStatus.COMPLETE)) {
                        throw new IllegalStateException("Car " + car.getId() + " has already been paid for.");
                }

                double amount = car.getServicePrice();
                String token = UUID.randomUUID().toString();

                Payment payment = Payment.builder()
                                .carId(car.getId())
                                .customerName(car.getCustomerName())
                                .amount(amount)
                                .paymentToken(token)
                                .status(paymentStatus.PENDING)
                                .build();

                paymentRepo.save(payment);

                // Build the raw params map.
                // The frontend will POST these as a hidden HTML form to PayFast,
                // which prevents the double-encoding signature mismatch bug.
                LinkedHashMap<String, String> params = buildPayFastParams(
                                car, amount, token, request.getCustomerEmail());

                return InitiatePaymentResponse.builder()
                                .payfastUrl(payfastConfig.getBaseUrl()) // https://sandbox.payfast.co.za/eng/process
                                .payfastParams(params) // raw key=value pairs
                                .paymentToken(token)
                                .amount(amount)
                                .customerName(car.getCustomerName())
                                .build();
        }

        // ── PayFast ITN handler ──────────────────────────────────────────────────

        public void handleItn(Map<String, String> itnParams, String rawBody) {

                boolean signatureValid = signatureUtil.verifySignatureFromRawBody(rawBody,
                                payfastConfig.getPassPhrase());
                if (!signatureValid) {
                        throw new SecurityException("PayFast ITN signature verification failed");
                }
                String token = itnParams.get("m_payment_id");
                Payment payment = paymentRepo.findByPaymentToken(token)
                                .orElseThrow(() -> new NoSuchElementException(
                                                "No payment found for token: " + token));

                String payfastStatus = itnParams.getOrDefault("payment_status", "");
                paymentStatus newStatus = switch (payfastStatus) {
                        case "COMPLETE" -> paymentStatus.COMPLETE;
                        case "FAILED" -> paymentStatus.FAILED;
                        case "CANCELLED" -> paymentStatus.CANCELLED;
                        default -> paymentStatus.PENDING;
                };

                payment.setPayfastPaymentId(itnParams.get("pf_payment_id"));
                payment.setPaymentMethod(itnParams.get("payment_method"));
                payment.setStatus(newStatus);

                if (newStatus == paymentStatus.COMPLETE) {
                        payment.setPaidAt(LocalDateTime.now());
                }

                paymentRepo.save(payment);

                if (newStatus == paymentStatus.COMPLETE) {
                        carRepo.findById(payment.getCarId()).ifPresent(car -> {
                                car.setPaid(true);
                                carRepo.save(car);
                                notificationService.notifyPaymentConfirmed(
                                                car.getPhoneNumber(),
                                                car.getCustomerName(),
                                                payment.getAmount());
                        });
                }
        }

        // ── Poll status ──────────────────────────────────────────────────────────

        public PaymentStatusResponse getPaymentStatus(String paymentToken) {
                Payment payment = paymentRepo.findByPaymentToken(paymentToken)
                                .orElseThrow(() -> new NoSuchElementException(
                                                "Payment not found: " + paymentToken));

                return PaymentStatusResponse.builder()
                                .paymentToken(payment.getPaymentToken())
                                .status(payment.getStatus())
                                .amount(payment.getAmount())
                                .customerName(payment.getCustomerName())
                                .carId(payment.getCarId())
                                .paidAt(payment.getPaidAt())
                                .build();
        }

        // ── Revenue ──────────────────────────────────────────────────────────────

        public double getTodayRevenue() {
                LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIDNIGHT);
                List<Payment> payments = paymentRepo.findByStatusAndPaidAtAfter(
                                paymentStatus.COMPLETE, startOfDay);
                return payments.stream().mapToDouble(Payment::getAmount).sum();
        }

        public List<RevenueByDayResponse> getRevenueByDay(int days) {
                List<RevenueByDayResponse> result = new ArrayList<>();
                LocalDate today = LocalDate.now();

                for (int i = days - 1; i >= 0; i--) {
                        LocalDate day = today.minusDays(i);
                        LocalDateTime start = day.atStartOfDay();
                        LocalDateTime end = day.atTime(LocalTime.MAX);

                        List<Payment> dayPayments = paymentRepo
                                        .findByStatusAndPaidAtAfter(paymentStatus.COMPLETE, start)
                                        .stream()
                                        .filter(p -> p.getPaidAt() != null && p.getPaidAt().isBefore(end))
                                        .toList();

                        double revenue = dayPayments.stream().mapToDouble(Payment::getAmount).sum();

                        result.add(RevenueByDayResponse.builder()
                                        .date(day.format(DATE_FMT))
                                        .label(i == 0 ? "Today" : day.format(LABEL_FMT))
                                        .revenue(revenue)
                                        .build());
                }

                return result;
        }

        // ── Build PayFast params (RAW, un-encoded) ───────────────────────────────

        private LinkedHashMap<String, String> buildPayFastParams(
                        Car car, double amount, String token, String customerEmail) {

                LinkedHashMap<String, String> params = new LinkedHashMap<>();

                params.put("merchant_id", payfastConfig.getMerchantId());
                params.put("merchant_key", payfastConfig.getMerchantKey());
                params.put("return_url", payfastConfig.getReturnUrl());
                params.put("cancel_url", payfastConfig.getCancelUrl());
                params.put("notify_url", payfastConfig.getNotifyUrl());

                params.put("name_first", car.getCustomerName().split(" ")[0]);
                params.put("name_last",
                                car.getCustomerName().contains(" ")
                                                ? car.getCustomerName()
                                                                .substring(car.getCustomerName().indexOf(' ') + 1)
                                                : "");

                if (customerEmail != null && !customerEmail.isBlank()) {
                        params.put("email_address", customerEmail.trim());
                }

                params.put("m_payment_id", token);
                params.put("amount", String.format(java.util.Locale.US, "%.2f", amount));
                params.put("item_name", "Car Wash - " + car.getServiceType().name());
                params.put("item_description", "Car: " + car.getLicensePlate());

                // Generate signature over ALL params including merchant_key
                String signature = signatureUtil.generateSignature(params, payfastConfig.getPassPhrase());
                params.put("signature", signature); // ← just append to same map

                return params; // ← return directly, no rebuilding needed
        }
}