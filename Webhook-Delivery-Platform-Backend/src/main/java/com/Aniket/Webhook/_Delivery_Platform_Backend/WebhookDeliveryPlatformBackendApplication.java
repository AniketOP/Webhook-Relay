package com.Aniket.Webhook._Delivery_Platform_Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WebhookDeliveryPlatformBackendApplication {

	public static void main(String[] args) {

		SpringApplication.run(WebhookDeliveryPlatformBackendApplication.class, args);

	}

}
