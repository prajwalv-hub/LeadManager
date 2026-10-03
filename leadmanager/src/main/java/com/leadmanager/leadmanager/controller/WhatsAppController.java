package com.leadmanager.leadmanager.controller;

import com.leadmanager.leadmanager.service.WhatsAppCloudService;
import com.leadmanager.leadmanager.service.WhatsAppService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/whatsapp")
public class WhatsAppController {

    private final WhatsAppService whatsAppService;
    private final WhatsAppCloudService whatsAppCloudService;

    public WhatsAppController(
            WhatsAppService whatsAppService,
            WhatsAppCloudService whatsAppCloudService) {

        this.whatsAppService = whatsAppService;
        this.whatsAppCloudService = whatsAppCloudService;
    }

    @PostMapping("/message")
    public String receiveMessage(
            @RequestParam String phone,
            @RequestParam String message) {

        return whatsAppService.processMessage(phone, message);
    }

    @PostMapping("/send-test")
    public String sendTest(@RequestParam String phone) {

        whatsAppCloudService.sendMessage(
                phone,
                "🚀 Hello from LeadManager AI!\n\n"
                        + "Your WhatsApp automation is connected successfully."
        );

        return "Message sent successfully";
    }
}