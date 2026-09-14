package com.Aniket.Webhook._Delivery_Platform_Backend.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;



import java.time.Instant;

@Data
@NoArgsConstructor

@Entity
public class DeliveryAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String deliveryId;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "subscriber_id")
    private Subscriber subscriber;

    private Integer retryNo;
    private String status;
    private String errorReason;
    private Instant attemptedAt;
    private Instant nextRetryAt;

}
