package com.Aniket.Webhook._Delivery_Platform_Backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class EventDTO {
    private String eventType;
    private String data;
}