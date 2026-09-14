package com.Aniket.Webhook._Delivery_Platform_Backend.repository;

import com.Aniket.Webhook._Delivery_Platform_Backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepo extends JpaRepository<Event, String> {
}
