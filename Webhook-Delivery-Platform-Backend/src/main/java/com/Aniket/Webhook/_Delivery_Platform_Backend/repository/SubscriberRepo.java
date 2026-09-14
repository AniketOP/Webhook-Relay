package com.Aniket.Webhook._Delivery_Platform_Backend.repository;

import com.Aniket.Webhook._Delivery_Platform_Backend.model.Subscriber;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriberRepo extends JpaRepository<Subscriber, String> {
}

