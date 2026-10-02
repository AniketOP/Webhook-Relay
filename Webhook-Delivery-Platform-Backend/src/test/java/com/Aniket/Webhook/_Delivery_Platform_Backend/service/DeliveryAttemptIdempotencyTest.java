package com.Aniket.Webhook._Delivery_Platform_Backend.service;

import com.Aniket.Webhook._Delivery_Platform_Backend.model.DeliveryAttempt;
import com.Aniket.Webhook._Delivery_Platform_Backend.model.Event;
import com.Aniket.Webhook._Delivery_Platform_Backend.model.Subscriber;
import com.Aniket.Webhook._Delivery_Platform_Backend.repository.DeliveryAttemptRepo;
import com.Aniket.Webhook._Delivery_Platform_Backend.repository.EventRepo;
import com.Aniket.Webhook._Delivery_Platform_Backend.repository.SubscriberRepo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
class DeliveryAttemptIdempotencyTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private DeliveryAttemptRepo deliveryAttemptRepo;

    @Autowired
    private EventRepo eventRepo;

    @Autowired
    private SubscriberRepo subscriberRepo;

    @Test
    void sameDeliveryIdStaysStableAcrossRetries() {
        Subscriber subscriber = new Subscriber();
        subscriber.setUrl("https://example.com/webhook");
        subscriber.setSecret("test-secret");
        subscriber = subscriberRepo.save(subscriber);

        Event event = new Event();
        event.setEventType("test.event");
        event.setData("{}");
        event = eventRepo.save(event);

        DeliveryAttempt attempt = new DeliveryAttempt();
        attempt.setSubscriber(subscriber);
        attempt.setEvent(event);
        attempt.setStatus("PENDING");
        attempt.setRetryNo(0);
        attempt.setAttemptedAt(Instant.now());

        DeliveryAttempt saved = deliveryAttemptRepo.save(attempt);
        String originalId = saved.getDeliveryId();

        saved.setStatus("FAILED");
        saved.setRetryNo(1);
        DeliveryAttempt updated = deliveryAttemptRepo.save(saved);

        assertEquals(originalId, updated.getDeliveryId());
        assertEquals(1L, deliveryAttemptRepo.count());
    }
}