package com.leadmanager.leadmanager.controller;

import com.leadmanager.leadmanager.service.WhatsAppCloudService;
import com.leadmanager.leadmanager.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/whatsapp/webhook")
public class WhatsAppWebhookController {

    @Value("${whatsapp.verify-token}")
    private String verifyToken;

    private final WhatsAppService whatsAppService;
    private final WhatsAppCloudService whatsAppCloudService;

    public WhatsAppWebhookController(
            WhatsAppService whatsAppService,
            WhatsAppCloudService whatsAppCloudService) {

        this.whatsAppService = whatsAppService;
        this.whatsAppCloudService = whatsAppCloudService;
    }

    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {

        if ("subscribe".equals(mode) && verifyToken.equals(token)) {
            return ResponseEntity.ok(challenge);
        }

        return ResponseEntity.status(403).body("Verification failed");
    }

    @PostMapping
    public ResponseEntity<String> receiveWebhook(
            @RequestBody Map<String, Object> payload) {

        try {
            System.out.println("================================");
            System.out.println("WHATSAPP WEBHOOK RECEIVED");
            System.out.println(payload);
            System.out.println("================================");

            var entry = (java.util.List<?>) payload.get("entry");

            if (entry == null || entry.isEmpty()) {
                return ResponseEntity.ok("EVENT_RECEIVED");
            }

            var entryMap = (Map<?, ?>) entry.get(0);

            var changes = (java.util.List<?>) entryMap.get("changes");

            if (changes == null || changes.isEmpty()) {
                return ResponseEntity.ok("EVENT_RECEIVED");
            }

            var change = (Map<?, ?>) changes.get(0);
            var value = (Map<?, ?>) change.get("value");

            var messages = (java.util.List<?>) value.get("messages");

            if (messages == null || messages.isEmpty()) {
                return ResponseEntity.ok("EVENT_RECEIVED");
            }

            var message = (Map<?, ?>) messages.get(0);

            String from = (String) message.get("from");

            var text = (Map<?, ?>) message.get("text");

            if (text == null) {
                return ResponseEntity.ok("EVENT_RECEIVED");
            }

            String messageText = (String) text.get("body");

            System.out.println("FROM: " + from);
            System.out.println("MESSAGE: " + messageText);

            String reply =
                    whatsAppService.processMessage(from, messageText);

            whatsAppCloudService.sendMessage(from, reply);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return ResponseEntity.ok("EVENT_RECEIVED");
    }
}