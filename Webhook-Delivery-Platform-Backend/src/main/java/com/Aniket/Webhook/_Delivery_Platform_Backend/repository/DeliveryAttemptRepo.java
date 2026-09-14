package com.Aniket.Webhook._Delivery_Platform_Backend.repository;

import com.Aniket.Webhook._Delivery_Platform_Backend.model.DeliveryAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface DeliveryAttemptRepo extends JpaRepository<DeliveryAttempt, String> {

    List<DeliveryAttempt> findByStatusAndNextRetryAtLessThanEqual(String status, Instant now);
}