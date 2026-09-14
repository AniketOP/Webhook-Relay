package com.Aniket.Webhook._Delivery_Platform_Backend.controller;


import com.Aniket.Webhook._Delivery_Platform_Backend.dto.SubscriberDTO;
import com.Aniket.Webhook._Delivery_Platform_Backend.model.Subscriber;
import com.Aniket.Webhook._Delivery_Platform_Backend.service.SubscriberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscriber")
@RequiredArgsConstructor
public class SubscriberController {

    private final SubscriberService subscriberService;

    @PostMapping
    public ResponseEntity<Subscriber> create(@RequestBody SubscriberDTO subscriberdto){
        return ResponseEntity.ok(subscriberService.createSubscriber(subscriberdto));
    }

    @GetMapping
    public ResponseEntity<List<Subscriber>> getAll() {
        List<Subscriber> subscribers = subscriberService.getAllSubscribers();
        return ResponseEntity.ok(subscribers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subscriber> getOne(@PathVariable String id){
        return ResponseEntity.ok(subscriberService.getSubscriberById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Subscriber> update(@PathVariable String id , @RequestBody SubscriberDTO subscriberdto){
        return ResponseEntity.ok(subscriberService.updateSubscriber(id, subscriberdto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id){
        subscriberService.deleteSubscriber(id);
        return ResponseEntity.noContent().build();
    }

}
