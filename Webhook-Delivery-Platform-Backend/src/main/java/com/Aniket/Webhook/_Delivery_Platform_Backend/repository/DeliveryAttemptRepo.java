package com.Aniket.Webhook._Delivery_Platform_Backend.repository;

import com.Aniket.Webhook._Delivery_Platform_Backend.model.DeliveryAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface DeliveryAttemptRepo extends JpaRepository<DeliveryAttempt, String> {



    @Query(value = "SELECT * FROM delivery_attempt WHERE status = :status AND next_retry_at <= :now FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<DeliveryAttempt> findDueForRetryWithLock(@Param("status")String status, @Param("now") Instant now);

}