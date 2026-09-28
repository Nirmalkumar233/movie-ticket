package com.example.movie.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/movies")
public class MovieController {

    // --- PASTE YOUR SPREADSHEET ID HERE ---
    private final String spreadsheetId = "1jbLLUct1Zi2u10iReltIzaAForbXeopkGrynztN-Ep8";

    @GetMapping("/health")
    public String healthCheck() {
        return "Movie Booking Backend Service is Running!";
    }

    @PostMapping("/book")
    public Map<String, Object> bookTickets(@RequestParam String movieTitle, @RequestParam int seatCount) {
        Map<String, Object> response = new HashMap<>();
        if (seatCount <= 0) {
            response.put("status", "ERROR");
            response.put("message", "Seat count must be at least 1.");
            return response;
        }

        // Later, your Google Sheets API integration code will use this 'spreadsheetId' 
        // variable to read seat availability and write the booking record.

        response.put("status", "SUCCESS");
        response.put("movie", movieTitle);
        response.put("seatsBooked", seatCount);
        response.put("totalPrice", seatCount * 200.0);
        return response;
    }
}