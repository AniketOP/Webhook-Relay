package com.Aniket.Webhook._Delivery_Platform_Backend.service;

import com.Aniket.Webhook._Delivery_Platform_Backend.model.DeliveryAttempt;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class DeliveryAttemptServiceTest {

    @Test
    void handleFailure_incrementsRetryAndSchedulesBackoff() {
        DeliveryAttemptService service = new DeliveryAttemptService(null, null, null, null, null, null);
        DeliveryAttempt attempt = new DeliveryAttempt();
        attempt.setRetryNo(0);

        service.handleFailure(attempt, "simulated failure");

        assertEquals("FAILED", attempt.getStatus());
        assertEquals(1, attempt.getRetryNo());
        assertNotNull(attempt.getNextRetryAt());


        long secondsUntilRetry = Instant.now().until(attempt.getNextRetryAt(), java.time.temporal.ChronoUnit.SECONDS);
        assertTrue(secondsUntilRetry >= 55 && secondsUntilRetry <= 60);
    }

    @Test
    void handleFailure_reachesDeadLetterAfterSixFailures() {
        DeliveryAttemptService service = new DeliveryAttemptService(null, null, null, null, null, null);
        DeliveryAttempt attempt = new DeliveryAttempt();
        attempt.setRetryNo(0);

        for (int i = 0; i < 6; i++) {
            service.handleFailure(attempt, "failure #" + i);
        }

        assertEquals("DEAD_LETTER", attempt.getStatus());
        assertNull(attempt.getNextRetryAt());
        assertEquals(5, attempt.getRetryNo());
    }
}
