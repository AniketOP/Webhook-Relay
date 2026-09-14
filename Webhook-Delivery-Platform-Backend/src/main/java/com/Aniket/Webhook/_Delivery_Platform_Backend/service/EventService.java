package com.Aniket.Webhook._Delivery_Platform_Backend.service;

import com.Aniket.Webhook._Delivery_Platform_Backend.dto.EventDTO;
import com.Aniket.Webhook._Delivery_Platform_Backend.exception.ResourceNotFoundException;
import com.Aniket.Webhook._Delivery_Platform_Backend.model.Event;
import com.Aniket.Webhook._Delivery_Platform_Backend.repository.EventRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepo eventRepo;

    public Event createEvent(EventDTO eventDto) {
        Event event = new Event();
        event.setEventType(eventDto.getEventType());
        event.setData(eventDto.getData());
        event.setCreatedAt(Instant.now());
        return eventRepo.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepo.findAll();
    }

    public Event getEventById(String id) {
        return eventRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid Event ID"));
    }

    public Event updateEvent(String id, EventDTO eventDto) {
        Event existing = getEventById(id);
        existing.setEventType(eventDto.getEventType());
        existing.setData(eventDto.getData());
        return eventRepo.save(existing);
    }

    public void deleteEvent(String id) {
        eventRepo.deleteById(id);
    }
}