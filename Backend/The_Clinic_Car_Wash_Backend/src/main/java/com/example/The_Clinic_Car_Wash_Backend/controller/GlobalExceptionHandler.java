package com.example.The_Clinic_Car_Wash_Backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // Handles @Valid failures — e.g. missing required field
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {
 
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .toList();
 
        System.out.println("[GlobalExceptionHandler] ❌ Validation failed: " + errors);
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, "Validation failed", errors);
    }
 
    // Car not found, payment not found, etc.
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoSuchElementException ex) {
        System.out.println("[GlobalExceptionHandler] ❌ Not found: " + ex.getMessage());
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }
 
    // Duplicate phone in queue, already paid, etc.
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(IllegalStateException ex) {
        System.out.println("[GlobalExceptionHandler] ❌ Conflict: " + ex.getMessage());
        return buildError(HttpStatus.CONFLICT, ex.getMessage(), null);
    }
 
    // Catch-all for anything unexpected
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        System.out.println("[GlobalExceptionHandler] ❌ Unexpected error: " + ex.getMessage());
        ex.printStackTrace();
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.", null);
    }
 
    // ── Helper ───────────────────────────────────────────────────────────────
 
    private ResponseEntity<Map<String, Object>> buildError(
            HttpStatus status, String message, List<String> details) {
 
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",    status.value());
        body.put("error",     status.getReasonPhrase());
        body.put("message",   message);
        if (details != null) body.put("details", details);
 
        return ResponseEntity.status(status).body(body);
    }
}
