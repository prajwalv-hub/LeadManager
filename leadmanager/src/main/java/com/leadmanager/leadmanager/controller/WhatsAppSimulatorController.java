package com.leadmanager.leadmanager.controller;

import com.leadmanager.leadmanager.service.WhatsAppService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/whatsapp/simulator")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class WhatsAppSimulatorController {

    private final WhatsAppService whatsAppService;

    public WhatsAppSimulatorController(WhatsAppService whatsAppService) {
        this.whatsAppService = whatsAppService;
    }

    @PostMapping("/message")
    public WhatsAppSimulatorResponse sendMessage(
            @RequestBody WhatsAppSimulatorRequest request) {

        String reply = whatsAppService.processMessage(
                request.phone(),
                request.message());

        return new WhatsAppSimulatorResponse(reply);
    }

    @PostMapping("/reset")
    public void resetConversation(
            @RequestBody ResetRequest request) {

        whatsAppService.resetConversation(request.phone());
    }

    public record WhatsAppSimulatorRequest(
            String phone,
            String message) {
    }

    public record ResetRequest(
            String phone) {
    }

    public record WhatsAppSimulatorResponse(
            String reply) {
    }
}