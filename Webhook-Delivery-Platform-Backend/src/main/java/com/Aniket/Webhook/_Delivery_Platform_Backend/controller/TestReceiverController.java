package com.Aniket.Webhook._Delivery_Platform_Backend.controller;

import com.sun.net.httpserver.HttpsServer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/test-receiver")
public class TestReceiverController {

    private final AtomicInteger callCount= new AtomicInteger(0);
    private static final int FAIL_UNTIL_ATTEMPT = 2;

    @PostMapping("/fail")
    public ResponseEntity<String> alwaysFail(@RequestBody String payload){
        int currentAttempt = callCount.incrementAndGet();
        System.out.println("Test receiver hit #" + currentAttempt + ". Payload: " + payload);

        if (currentAttempt <= FAIL_UNTIL_ATTEMPT) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Simulated failure #" + currentAttempt);
        }
        return ResponseEntity.ok("Recovered! Accepted on attempt #" + currentAttempt);
    }

    @PostMapping("/reset")
    public String resetCounter() {
        callCount.set(0);
        return "Counter reset to 0";
    }
}

