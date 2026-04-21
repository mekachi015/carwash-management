package com.example.The_Clinic_Car_Wash_Backend.utils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class PayfastSignatureUtil {

    public String generateSignature(LinkedHashMap<String, String> params, String passphrase) {
        try {
            StringBuilder sb = new StringBuilder();
            for (Map.Entry<String, String> entry : params.entrySet()) {
                String value = (entry.getValue() != null) ? entry.getValue().trim() : "";
                if (!value.isEmpty()) {
                    if (sb.length() > 0)
                        sb.append("&");
                    sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
                    sb.append("=");
                    sb.append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                }
            }
            if (passphrase != null && !passphrase.isBlank()) {
                sb.append("&passphrase=")
                        .append(URLEncoder.encode(passphrase.trim(), StandardCharsets.UTF_8));
            }
            System.out.println("[PayFastSignatureUtil] Outbound hash string: " + sb);
            return md5(sb.toString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PayFast signature", e);
        }
    }

    // Used for INBOUND ITN verification (params received FROM PayFast)
    // Values are already decoded — do NOT re-encode, just concatenate raw
    public boolean verifySignature(Map<String, String> itnParams, String passphrase) {
        String receivedSignature = itnParams.get("signature");
        if (receivedSignature == null)
            return false;

        try {
            StringBuilder sb = new StringBuilder();
            for (Map.Entry<String, String> entry : itnParams.entrySet()) {
                if ("signature".equals(entry.getKey()))
                    continue;
                String value = (entry.getValue() != null) ? entry.getValue().trim() : "";
                if (!value.isEmpty()) {
                    if (sb.length() > 0)
                        sb.append("&");
                    // Values already decoded from raw body — no URLEncoder
                    sb.append(entry.getKey()).append("=").append(value);
                }
            }
            if (passphrase != null && !passphrase.isBlank()) {
                sb.append("&passphrase=").append(passphrase.trim());
            }

            System.out.println("[PayFastSignatureUtil] ITN hash string: " + sb);

            String expectedSignature = md5(sb.toString());
            boolean valid = expectedSignature.equalsIgnoreCase(receivedSignature);

            System.out.printf("[PayFastSignatureUtil] expected: %s | received: %s | valid: %b%n",
                    expectedSignature, receivedSignature, valid);

            return valid;
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify PayFast ITN signature", e);
        }
    }

    private String md5(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : digest)
            hex.append(String.format("%02x", b));
        return hex.toString();
    }

    // Verify using the raw URL-encoded body string directly
    public boolean verifySignatureFromRawBody(String rawBody, String passphrase) {
        try {
            // Extract the received signature from the raw body
            String receivedSignature = null;
            StringBuilder sb = new StringBuilder();

            for (String pair : rawBody.split("&")) {
                String[] kv = pair.split("=", 2);
                if (kv.length != 2)
                    continue;
                String key = java.net.URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
                if ("signature".equals(key)) {
                    receivedSignature = java.net.URLDecoder.decode(kv[1], StandardCharsets.UTF_8);
                    continue; // exclude from hash string
                }
                // Keep the raw encoded pair exactly as PayFast sent it
                if (sb.length() > 0)
                    sb.append("&");
                sb.append(pair);
            }

            if (receivedSignature == null)
                return false;

            // Append passphrase raw (it has no special chars)
            if (passphrase != null && !passphrase.isBlank()) {
                sb.append("&passphrase=").append(passphrase.trim());
            }

            System.out.println("[PayFastSignatureUtil] ITN hash string: " + sb);

            String expectedSignature = md5(sb.toString());
            boolean valid = expectedSignature.equalsIgnoreCase(receivedSignature);

            System.out.printf("[PayFastSignatureUtil] expected: %s | received: %s | valid: %b%n",
                    expectedSignature, receivedSignature, valid);

            return valid;
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify PayFast ITN signature", e);
        }
    }
}