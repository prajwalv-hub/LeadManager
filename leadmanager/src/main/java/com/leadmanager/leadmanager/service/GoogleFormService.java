package com.leadmanager.leadmanager.service;

import com.leadmanager.leadmanager.dto.GoogleFormLeadRequest;
import com.leadmanager.leadmanager.entity.Booking;
import com.leadmanager.leadmanager.entity.Inquiry;
import com.leadmanager.leadmanager.entity.Lead;
import com.leadmanager.leadmanager.repository.BookingRepository;
import com.leadmanager.leadmanager.repository.InquiryRepository;
import com.leadmanager.leadmanager.repository.LeadRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class GoogleFormService {

    private final LeadRepository leadRepository;
    private final BookingRepository bookingRepository;
    private final InquiryRepository inquiryRepository;

    public GoogleFormService(
            LeadRepository leadRepository,
            BookingRepository bookingRepository,
            InquiryRepository inquiryRepository) {

        this.leadRepository = leadRepository;
        this.bookingRepository = bookingRepository;
        this.inquiryRepository = inquiryRepository;
    }

    public String processFormSubmission(GoogleFormLeadRequest request) {

        Lead lead = leadRepository.findByPhone(request.getPhone())
                .orElseGet(() -> {
                    Lead newLead = new Lead();

                    newLead.setName(request.getName());
                    newLead.setPhone(request.getPhone());
                    newLead.setEmail(request.getEmail());
                    newLead.setSource("GOOGLE_FORM");
                    newLead.setPropertyType(request.getPropertyType());
                    newLead.setRequirements(request.getRequirements());

                    if (request.getPreferredVisitDate() != null
                            && !request.getPreferredVisitDate().isBlank()) {

                        newLead.setPreferredVisitDate(
                                LocalDate.parse(
                                        request.getPreferredVisitDate(),
                                        DateTimeFormatter.ofPattern("dd/MM/yyyy")
                                )
                        );
                    }

                    return leadRepository.save(newLead);
                });

        boolean wantsVisit =
                request.getVisitDecision() != null &&
                request.getVisitDecision()
                        .equalsIgnoreCase("Yes, I'd like to schedule a visit");

        if (wantsVisit &&
                request.getPreferredVisitDate() != null &&
                !request.getPreferredVisitDate().isBlank()) {

            Booking booking = new Booking();

            booking.setLead(lead);
            booking.setPropertyType(request.getPropertyType());

            LocalDate date = LocalDate.parse(
                    request.getPreferredVisitDate(),
                    DateTimeFormatter.ofPattern("dd/MM/yyyy")
            );

            LocalTime time = LocalTime.parse(
                    request.getPreferredVisitTime(),
                    DateTimeFormatter.ofPattern("HH:mm:ss")
            );

            booking.setBookingDate(date);
            booking.setBookingTime(time);

            bookingRepository.save(booking);

            lead.setStatus("VISIT_BOOKED");
            leadRepository.save(lead);

            return "Lead created and site visit booked successfully";
        }

        Inquiry inquiry = new Inquiry();
        inquiry.setLead(lead);

        inquiryRepository.save(inquiry);

        lead.setStatus("NEW");
        leadRepository.save(lead);

        return "Lead created and added to enquiry queue";
    }
}