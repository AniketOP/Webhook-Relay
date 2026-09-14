package com.Aniket.Webhook._Delivery_Platform_Backend.controller;

import com.sun.net.httpserver.HttpsServer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test-receiver")
public class TestReceiverController {

    @PostMapping("/fail")
    public ResponseEntity<String> alwaysFail(@RequestBody String payload){
        System.out.println("Test receiver got a delivery attempt. Payload: " + payload);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Simulated failure");
    }
}
