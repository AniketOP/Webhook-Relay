package com.Aniket.Webhook._Delivery_Platform_Backend.controller;

import com.Aniket.Webhook._Delivery_Platform_Backend.dto.EventDTO;
import com.Aniket.Webhook._Delivery_Platform_Backend.model.Event;
import com.Aniket.Webhook._Delivery_Platform_Backend.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/event")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<Event> create(@RequestBody EventDTO eventDto) {
        return ResponseEntity.ok(eventService.createEvent(eventDto));
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAll() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getOne(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Event> update(@PathVariable String id, @RequestBody EventDTO eventDto) {
        return ResponseEntity.ok(eventService.updateEvent(id, eventDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}