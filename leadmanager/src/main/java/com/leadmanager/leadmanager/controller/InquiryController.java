package com.leadmanager.leadmanager.controller;

import com.leadmanager.leadmanager.entity.Inquiry;
import com.leadmanager.leadmanager.entity.Lead;
import com.leadmanager.leadmanager.repository.InquiryRepository;
import com.leadmanager.leadmanager.repository.LeadRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryRepository inquiryRepository;
    private final LeadRepository leadRepository;

    public InquiryController(
            InquiryRepository inquiryRepository,
            LeadRepository leadRepository) {

        this.inquiryRepository = inquiryRepository;
        this.leadRepository = leadRepository;
    }

    @PostMapping
    public Inquiry createInquiry(@RequestBody Inquiry inquiry) {

        Long leadId = inquiry.getLead().getId();

        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() ->
                        new RuntimeException("Lead not found"));

        inquiry.setLead(lead);

        return inquiryRepository.save(inquiry);
    }


    // FIFO active call queue
    @GetMapping("/queue")
    public List<Inquiry> getCallQueue() {

        return inquiryRepository
                .findByStatusOrderByCreatedAtAsc("PENDING");
    }


    // Call history
    @GetMapping("/history")
    public List<Inquiry> getCallHistory() {

        List<Inquiry> interested =
                inquiryRepository
                        .findByStatusOrderByHandledAtDesc("INTERESTED");

        List<Inquiry> notInterested =
                inquiryRepository
                        .findByStatusOrderByHandledAtDesc("NOT_INTERESTED");

        List<Inquiry> history = new ArrayList<>();

        history.addAll(interested);
        history.addAll(notInterested);

        history.sort(
                Comparator.comparing(
                        Inquiry::getHandledAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                )
        );

        return history;
    }


    // Employee handles enquiry
    @PutMapping("/{id}/status")
    public Inquiry updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Inquiry not found"));

        inquiry.setStatus(status);

        if (!status.equals("PENDING")) {
            inquiry.setHandledAt(LocalDateTime.now());
        }

        return inquiryRepository.save(inquiry);
    }


    // All enquiries
    @GetMapping
    public List<Inquiry> getAllInquiries() {

        return inquiryRepository.findAll();
    }
}