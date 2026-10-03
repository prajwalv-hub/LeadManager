package com.leadmanager.leadmanager.service;

import com.leadmanager.leadmanager.ai.AIConversationService;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {

    private final AIConversationService aiConversationService;

    public WhatsAppService(AIConversationService aiConversationService) {
        this.aiConversationService = aiConversationService;
    }

    public String processMessage(String phone, String message) {

        if (phone == null || phone.isBlank()) {
            return "Sorry, I couldn't identify your phone number.";
        }

        if (message == null || message.isBlank()) {
            return "Please send me a message so I can help you. 😊";
        }

        return aiConversationService.processMessage(
                phone.trim(),
                message.trim());
    }

    public void resetConversation(String phone) {
        if (phone != null && !phone.isBlank()) {
            aiConversationService.resetConversation(phone.trim());
        }
    }
}