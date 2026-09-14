package com.Aniket.Webhook._Delivery_Platform_Backend.model;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.Instant;

@Entity
@Data
@NoArgsConstructor

public class Subscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String subscriberId;
    private String name;
    private String email;
    private String url;
    private Instant createdAt;
    private boolean active;

}
