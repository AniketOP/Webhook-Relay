package com.Aniket.Webhook._Delivery_Platform_Backend.service;

import com.Aniket.Webhook._Delivery_Platform_Backend.dto.SubscriberDTO;
import com.Aniket.Webhook._Delivery_Platform_Backend.exception.ResourceNotFoundException;
import com.Aniket.Webhook._Delivery_Platform_Backend.model.Subscriber;
import com.Aniket.Webhook._Delivery_Platform_Backend.repository.SubscriberRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriberService {

    private final SubscriberRepo subscriberRepo;

    public Subscriber createSubscriber(SubscriberDTO subscriberdto) {
        Subscriber subscriber = new Subscriber();

        subscriber.setName(subscriberdto.getName());
        subscriber.setEmail(subscriberdto.getEmail());
        subscriber.setUrl(subscriberdto.getUrl());
        subscriber.setActive(true);
        subscriber.setCreatedAt(Instant.now());
        return subscriberRepo.save(subscriber);
    }


    public List<Subscriber> getAllSubscribers() {
        return subscriberRepo.findAll();
    }

    public Subscriber getSubscriberById(String id) {
        return subscriberRepo.findById(id)
                .orElseThrow(() ->(new ResourceNotFoundException("Invalid User ID")));
    }


    public Subscriber updateSubscriber(String id, SubscriberDTO updated) {
        Subscriber existing = getSubscriberById(id);
        existing.setName(updated.getName());
        existing.setUrl(updated.getUrl());
        existing.setEmail(updated.getEmail());
        return subscriberRepo.save(existing);
    }

    public void deleteSubscriber(String id) {
        subscriberRepo.deleteById(id);
    }
}
