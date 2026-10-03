package com.leadmanager.leadmanager.controller;

import com.leadmanager.leadmanager.dto.GoogleFormLeadRequest;
import com.leadmanager.leadmanager.entity.Lead;
import com.leadmanager.leadmanager.repository.LeadRepository;
import com.leadmanager.leadmanager.service.GoogleFormService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadRepository leadRepository;
    private final GoogleFormService googleFormService;

    public LeadController(
            LeadRepository leadRepository,
            GoogleFormService googleFormService) {

        this.leadRepository = leadRepository;
        this.googleFormService = googleFormService;
    }

    @PutMapping("/{id}/status")
    public Lead updateLeadStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        lead.setStatus(status);

        return leadRepository.save(lead);
    }

    @PostMapping
    public Lead createLead(@RequestBody Lead lead) {
        return leadRepository.save(lead);
    }

    @PostMapping("/form")
    public String processGoogleForm(
            @RequestBody GoogleFormLeadRequest request) {

        return googleFormService.processFormSubmission(request);
    }

    @GetMapping
    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    @GetMapping("/{id}")
    public Lead getLeadById(@PathVariable Long id) {

        return leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
    }
}