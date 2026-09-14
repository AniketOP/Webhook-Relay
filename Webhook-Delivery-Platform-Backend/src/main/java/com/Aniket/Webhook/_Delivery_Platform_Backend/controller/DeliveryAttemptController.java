package com.Aniket.Webhook._Delivery_Platform_Backend.controller;

import com.Aniket.Webhook._Delivery_Platform_Backend.dto.DeliveryAttemptDTO;
import com.Aniket.Webhook._Delivery_Platform_Backend.model.DeliveryAttempt;
import com.Aniket.Webhook._Delivery_Platform_Backend.service.DeliveryAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/delivery-attempt")
@RequiredArgsConstructor
public class DeliveryAttemptController {

    private final DeliveryAttemptService deliveryAttemptService;

    @PostMapping
    public ResponseEntity<DeliveryAttempt> create(@RequestBody DeliveryAttemptDTO dto) {
        return ResponseEntity.ok(deliveryAttemptService.createDeliveryAttempt(dto));
    }

    @GetMapping
    public ResponseEntity<List<DeliveryAttempt>> getAll() {
        return ResponseEntity.ok(deliveryAttemptService.getAllDeliveryAttempts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryAttempt> getOne(@PathVariable String id) {
        return ResponseEntity.ok(deliveryAttemptService.getDeliveryAttemptById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DeliveryAttempt> update(@PathVariable String id, @RequestBody DeliveryAttemptDTO dto) {
        return ResponseEntity.ok(deliveryAttemptService.updateDeliveryAttempt(id, dto));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<Void> send(@PathVariable String id){
        deliveryAttemptService.sendToDeliveryQueue(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        deliveryAttemptService.deleteDeliveryAttempt(id);
        return ResponseEntity.noContent().build();
    }
}