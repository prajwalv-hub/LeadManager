package com.leadmanager.leadmanager.controller;

import com.leadmanager.leadmanager.repository.BookingRepository;
import com.leadmanager.leadmanager.repository.InquiryRepository;
import com.leadmanager.leadmanager.repository.LeadRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final LeadRepository leadRepository;
    private final BookingRepository bookingRepository;
    private final InquiryRepository inquiryRepository;

    public DashboardController(
            LeadRepository leadRepository,
            BookingRepository bookingRepository,
            InquiryRepository inquiryRepository) {

        this.leadRepository = leadRepository;
        this.bookingRepository = bookingRepository;
        this.inquiryRepository = inquiryRepository;
    }

    @GetMapping
    public Map<String, Long> getDashboard(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        Map<String, Long> dashboard = new HashMap<>();

        // No date filter
        if (from == null || to == null) {

            dashboard.put("totalLeads", leadRepository.count());
            dashboard.put("totalVisits", bookingRepository.count());
            dashboard.put("totalEnquiries", inquiryRepository.count());

            return dashboard;
        }

        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);

        LocalDateTime fromDateTime =
                fromDate.atStartOfDay();

        LocalDateTime toDateTime =
                toDate.atTime(LocalTime.MAX);

        long leads =
                leadRepository.countByCreatedAtBetween(
                        fromDateTime,
                        toDateTime
                );

        long visits =
                bookingRepository
                        .findByBookingDateBetween(fromDate, toDate)
                        .size();

        long enquiries =
                inquiryRepository.countByCreatedAtBetween(
                        fromDateTime,
                        toDateTime
                );

        dashboard.put("totalLeads", leads);
        dashboard.put("totalVisits", visits);
        dashboard.put("totalEnquiries", enquiries);

        return dashboard;
    }
}