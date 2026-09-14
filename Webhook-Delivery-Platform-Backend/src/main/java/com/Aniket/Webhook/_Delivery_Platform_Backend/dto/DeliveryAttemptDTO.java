package com.Aniket.Webhook._Delivery_Platform_Backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DeliveryAttemptDTO {
    private String eventId;
    private String subscriberId;
    private Integer retryNo;
    private String status;
    private String errorReason;
}
