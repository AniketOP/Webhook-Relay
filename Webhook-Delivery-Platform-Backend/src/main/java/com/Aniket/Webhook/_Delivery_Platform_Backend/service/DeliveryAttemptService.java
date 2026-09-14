    package com.Aniket.Webhook._Delivery_Platform_Backend.service;

    import com.Aniket.Webhook._Delivery_Platform_Backend.dto.DeliveryAttemptDTO;
    import com.Aniket.Webhook._Delivery_Platform_Backend.exception.ResourceNotFoundException;
    import com.Aniket.Webhook._Delivery_Platform_Backend.model.DeliveryAttempt;
    import com.Aniket.Webhook._Delivery_Platform_Backend.model.Event;
    import com.Aniket.Webhook._Delivery_Platform_Backend.model.Subscriber;
    import com.Aniket.Webhook._Delivery_Platform_Backend.repository.DeliveryAttemptRepo;
    import jakarta.transaction.Transactional;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.MediaType;
    import org.springframework.http.ResponseEntity;
    import org.springframework.kafka.annotation.KafkaListener;
    import org.springframework.kafka.core.KafkaTemplate;
    import org.springframework.scheduling.annotation.Scheduled;
    import org.springframework.stereotype.Service;
    import org.springframework.web.client.RestClient;
    import org.springframework.web.client.RestClientResponseException;

    import java.time.Instant;
    import java.util.List;

    @Service
    @RequiredArgsConstructor
    public class DeliveryAttemptService {

        private final DeliveryAttemptRepo deliveryAttemptRepo;
        private final EventService eventService;
        private final SubscriberService subscriberService;
        private final RestClient restClient = RestClient.create();
        private final KafkaTemplate<String , String > kafkaTemplate;



        public DeliveryAttempt createDeliveryAttempt(DeliveryAttemptDTO dto) {
            Event event = eventService.getEventById(dto.getEventId());
            Subscriber subscriber = subscriberService.getSubscriberById(dto.getSubscriberId());

            DeliveryAttempt attempt = new DeliveryAttempt();
            attempt.setEvent(event);
            attempt.setSubscriber(subscriber);
            attempt.setRetryNo(dto.getRetryNo());
            attempt.setStatus(dto.getStatus());
            attempt.setErrorReason(dto.getErrorReason());
            attempt.setAttemptedAt(Instant.now());
            return deliveryAttemptRepo.save(attempt);
        }

        public List<DeliveryAttempt> getAllDeliveryAttempts() {
            return deliveryAttemptRepo.findAll();
        }

        public DeliveryAttempt getDeliveryAttemptById(String id) {
            return deliveryAttemptRepo.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Invalid Delivery Attempt ID"));
        }

        public DeliveryAttempt updateDeliveryAttempt(String id, DeliveryAttemptDTO dto) {
            DeliveryAttempt existing = getDeliveryAttemptById(id);
            existing.setRetryNo(dto.getRetryNo());
            existing.setStatus(dto.getStatus());
            existing.setErrorReason(dto.getErrorReason());
            return deliveryAttemptRepo.save(existing);
        }

        public DeliveryAttempt sendRequest(DeliveryAttempt deliveryAttempt){
            String url = deliveryAttempt.getSubscriber().getUrl();
            String data = deliveryAttempt.getDeliveryId();

            String idempotencyKey = deliveryAttempt.getEvent().getId();

            try{
                ResponseEntity<String> response = restClient.post()
                        .uri(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Idempotency-Key",idempotencyKey)
                        .body(data)
                        .retrieve()
                        .toEntity(String.class);

                deliveryAttempt.setStatus("SUCCESS");
                deliveryAttempt.setErrorReason(null);
            }catch(RestClientResponseException e){

                handleFailure(deliveryAttempt,"HTTP " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            }catch (Exception e) {
                handleFailure(deliveryAttempt,"Network Error: " + e.getMessage());
            }

            return deliveryAttemptRepo.save(deliveryAttempt);

        }


        @Transactional
        @Scheduled(fixedRate = 3000)
        public void scheduled(){
            List<DeliveryAttempt> deliveryAttempts = deliveryAttemptRepo.findDueForRetryWithLock("FAILED", Instant.now());
            for(DeliveryAttempt deliveryAttempt : deliveryAttempts) {
                sendToDeliveryQueue(deliveryAttempt.getDeliveryId());
            }
        }




        public void handleFailure(DeliveryAttempt deliveryAttempt, String errorReason){
            deliveryAttempt.setErrorReason(errorReason);

            if(deliveryAttempt.getRetryNo() >= 5){
                deliveryAttempt.setStatus("DEAD_LETTER");
                deliveryAttempt.setNextRetryAt(null);
            }
            else{
                deliveryAttempt.setStatus("FAILED");
                deliveryAttempt.setRetryNo(deliveryAttempt.getRetryNo()+ 1);
                long delaySeconds = (long)(30 * Math.pow(2, deliveryAttempt.getRetryNo()));
                deliveryAttempt.setNextRetryAt(Instant.now().plusSeconds(10));
            }
        }

        public void sendToDeliveryQueue(String id){
            String topic = "delivery-attempts";
            kafkaTemplate.send(topic,id);
            System.out.println("Published ID to Kafka: "+ id);
        }


        @KafkaListener(topics = "delivery-attempts", groupId = "webhook-delivery-group")
        public void receivedDeliveryId(String id){
            DeliveryAttempt deliveryAttempt = getDeliveryAttemptById(id);
            sendRequest(deliveryAttempt);
        }




        public void deleteDeliveryAttempt(String id) {
            deliveryAttemptRepo.deleteById(id);
        }
    }