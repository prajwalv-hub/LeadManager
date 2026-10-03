package com.leadmanager.leadmanager.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class WhatsAppCloudService {

    @Value("${whatsapp.phone-number-id}")
    private String phoneNumberId;

    @Value("${whatsapp.access-token}")
    private String accessToken;

    private final RestClient restClient = RestClient.create();

    public void sendMessage(String to, String message) {

        String url = "https://graph.facebook.com/v26.0/"
                + phoneNumberId
                + "/messages";

        Map<String, Object> body = Map.of(
                "messaging_product", "whatsapp",
                "to", to,
                "type", "text",
                "text", Map.of(
                        "body", message
                )
        );

        var response = restClient.post()
                .uri(url)
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + accessToken
                )
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(String.class);

        System.out.println("======================================");
        System.out.println("META STATUS: " + response.getStatusCode());
        System.out.println("META RESPONSE: " + response.getBody());
        System.out.println("======================================");
    }
}