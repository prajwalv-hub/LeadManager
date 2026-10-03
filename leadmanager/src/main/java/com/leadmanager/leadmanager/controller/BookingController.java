package com.leadmanager.leadmanager.controller;

import com.leadmanager.leadmanager.entity.Booking;
import com.leadmanager.leadmanager.entity.Lead;
import com.leadmanager.leadmanager.repository.BookingRepository;
import com.leadmanager.leadmanager.repository.LeadRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final LeadRepository leadRepository;

    public BookingController(
            BookingRepository bookingRepository,
            LeadRepository leadRepository) {

        this.bookingRepository = bookingRepository;
        this.leadRepository = leadRepository;
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {

        Long leadId = booking.getLead().getId();

        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        booking.setLead(lead);

        if (booking.getPropertyType() == null) {
            booking.setPropertyType(lead.getPropertyType());
        }

        return bookingRepository.save(booking);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}