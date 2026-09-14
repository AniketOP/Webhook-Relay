package com.Aniket.Webhook._Delivery_Platform_Backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SubscriberDTO {
    private String name;
    private String email;
    private String url;
}
