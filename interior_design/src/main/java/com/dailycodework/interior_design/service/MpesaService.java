package com.dailycodework.interior_design.service;

import org.springframework.stereotype.Service;

@Service
public class MpesaService {

    public String initiateSTKPush(String phoneNumber, Double amount, Long orderId) {
        // TODO: Implement actual Safaricom Daraja API integration
        // Example: POST to Daraja STK Push endpoint with BusinessShortCode, Passkey, amount, phoneNumber, etc.
        // Return CheckoutRequestID for tracking

        System.out.println("Initiating STK Push for: " + phoneNumber + ", Ksh " + amount + ", OrderId " + orderId);
        return "STK123456789"; // mock ID
    }
}
