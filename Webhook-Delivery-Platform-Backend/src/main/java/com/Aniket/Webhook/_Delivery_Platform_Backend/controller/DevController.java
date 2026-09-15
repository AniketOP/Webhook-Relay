package com.Aniket.Webhook._Delivery_Platform_Backend.controller;

import com.Aniket.Webhook._Delivery_Platform_Backend.model.ApiKey;
import com.Aniket.Webhook._Delivery_Platform_Backend.repository.ApiKeyRepo;
import com.Aniket.Webhook._Delivery_Platform_Backend.util.HashUtil;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/dev")
@AllArgsConstructor
public class DevController {

    private final ApiKeyRepo apiKeyRepo;

    @PostMapping("/generate-api-key")
    public String  generateApiKey(){

        ApiKey apiKey = new ApiKey();
        String randomId = String.valueOf(UUID.randomUUID());
        apiKey.setHashedKey(HashUtil.sha256(randomId));
        apiKey.setActive(true);
        apiKey.setLabel("Only Active for this Session");
        apiKey.setCreatedAt(Instant.now());
        apiKeyRepo.save(apiKey);

        return randomId;
    }
}
