package com.Aniket.Webhook._Delivery_Platform_Backend.repository;

import com.Aniket.Webhook._Delivery_Platform_Backend.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApiKeyRepo extends JpaRepository<ApiKey,String > {
    Optional<ApiKey> findByHashedKeyAndActiveTrue(String hashedKey);
}
