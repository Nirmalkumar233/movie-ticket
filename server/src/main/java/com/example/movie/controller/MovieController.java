package com.example.movie.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")



// Update this line inside MovieControllerTest.java
mockMvc.perform(get("/api/payment/health")) // Change from /api/v1/movies/health to /api/payment/health
       .andExpect(status().isOk());



public class MovieController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${google.sheets.id}")
    private String googleSheetsId;

    @GetMapping("/health")
    public String healthCheck() {
        return "Server is running!";
    }

    @PostMapping("/create-order")
    public String createOrder(@RequestParam int amount) {
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount * 100); // Amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);
            return order.toString();
        } catch (RazorpayException e) {
            e.printStackTrace();
            return "Error creating order: " + e.getMessage();
        }
    }
}