package com.leadmanager.leadmanager.service;

import com.leadmanager.leadmanager.dto.DashboardAnalyticsResponse;
import com.leadmanager.leadmanager.entity.Booking;
import com.leadmanager.leadmanager.entity.Inquiry;
import com.leadmanager.leadmanager.entity.Lead;
import com.leadmanager.leadmanager.repository.BookingRepository;
import com.leadmanager.leadmanager.repository.InquiryRepository;
import com.leadmanager.leadmanager.repository.LeadRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final LeadRepository leadRepository;
    private final BookingRepository bookingRepository;
    private final InquiryRepository inquiryRepository;

    public AnalyticsService(
            LeadRepository leadRepository,
            BookingRepository bookingRepository,
            InquiryRepository inquiryRepository) {

        this.leadRepository = leadRepository;
        this.bookingRepository = bookingRepository;
        this.inquiryRepository = inquiryRepository;
    }

    public DashboardAnalyticsResponse getAnalytics(
            LocalDate from,
            LocalDate to) {

        List<Lead> leads = leadRepository.findAll();

        List<Booking> bookings = bookingRepository.findAll();

        // Apply date filter
        if (from != null && to != null) {

            LocalDateTime start = from.atStartOfDay();
            LocalDateTime end = to.plusDays(1).atStartOfDay();

            leads = leads.stream()
                    .filter(lead ->
                            lead.getCreatedAt() != null &&
                            !lead.getCreatedAt().isBefore(start) &&
                            lead.getCreatedAt().isBefore(end)
                    )
                    .collect(Collectors.toList());

            bookings = bookings.stream()
                    .filter(booking ->
                            booking.getBookingDate() != null &&
                            !booking.getBookingDate().isBefore(from) &&
                            !booking.getBookingDate().isAfter(to)
                    )
                    .collect(Collectors.toList());
        }

        DashboardAnalyticsResponse response =
                new DashboardAnalyticsResponse();

        // =========================
        // KPI TOTALS
        // =========================

        response.setTotalLeads(leads.size());

        response.setTotalVisits(bookings.size());

        // =========================
        // TOTAL ENQUIRIES
        // =========================

        if (from != null && to != null) {

            LocalDateTime start = from.atStartOfDay();
            LocalDateTime end = to.plusDays(1).atStartOfDay();

            long enquiryCount = inquiryRepository.findAll()
                    .stream()
                    .filter(inquiry ->
                            inquiry.getCreatedAt() != null &&
                            !inquiry.getCreatedAt().isBefore(start) &&
                            inquiry.getCreatedAt().isBefore(end)
                    )
                    .count();

            response.setTotalEnquiries(enquiryCount);

        } else {

            response.setTotalEnquiries(
                    inquiryRepository.findAll().size()
            );
        }

        // =========================
        // LEADS BY SOURCE
        // =========================

        Map<String, Long> leadsBySource =
                leads.stream()
                        .collect(
                                Collectors.groupingBy(
                                        lead ->
                                                lead.getSource() == null ||
                                                lead.getSource().isBlank()
                                                        ? "UNKNOWN"
                                                        : lead.getSource(),
                                        LinkedHashMap::new,
                                        Collectors.counting()
                                )
                        );

        response.setLeadsBySource(leadsBySource);

        // =========================
        // LEADS BY PROPERTY
        // =========================

        Map<String, Long> leadsByProperty =
                leads.stream()
                        .collect(
                                Collectors.groupingBy(
                                        lead ->
                                                lead.getPropertyType() == null ||
                                                lead.getPropertyType().isBlank()
                                                        ? "UNKNOWN"
                                                        : lead.getPropertyType(),
                                        LinkedHashMap::new,
                                        Collectors.counting()
                                )
                        );

        response.setLeadsByProperty(leadsByProperty);

        // =========================
        // LEADS BY STATUS
        // =========================

        Map<String, Long> leadsByStatus =
                leads.stream()
                        .collect(
                                Collectors.groupingBy(
                                        lead ->
                                                lead.getStatus() == null ||
                                                lead.getStatus().isBlank()
                                                        ? "UNKNOWN"
                                                        : lead.getStatus(),
                                        LinkedHashMap::new,
                                        Collectors.counting()
                                )
                        );

        response.setLeadsByStatus(leadsByStatus);

        // =========================
        // LEADS OVER TIME
        // =========================

        Map<LocalDate, Long> dailyCounts =
                leads.stream()
                        .filter(lead -> lead.getCreatedAt() != null)
                        .collect(
                                Collectors.groupingBy(
                                        lead -> lead.getCreatedAt().toLocalDate(),
                                        LinkedHashMap::new,
                                        Collectors.counting()
                                )
                        );

        List<DashboardAnalyticsResponse.DailyLeadData> leadsOverTime =
                dailyCounts.entrySet()
                        .stream()
                        .sorted(Map.Entry.comparingByKey())
                        .map(entry ->
                                new DashboardAnalyticsResponse.DailyLeadData(
                                        entry.getKey().toString(),
                                        entry.getValue()
                                )
                        )
                        .collect(Collectors.toList());

        response.setLeadsOverTime(leadsOverTime);

        return response;
    }
}