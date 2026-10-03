package com.leadmanager.leadmanager.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;

import com.google.genai.types.Content;
import com.google.genai.types.Part;

import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
public class GeminiService {

  private final ObjectMapper objectMapper;
  private final Client client;

  public GeminiService(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
    this.client = new Client();
  }

  public AIConversationResult understand(
      String customerMessage,
      String conversationContext) {

    String currentDateTime = ZonedDateTime.now(
        ZoneId.of("Asia/Kolkata")).toString();

    String systemInstruction = """
        You are the AI property assistant for UrbanNest Realty.

        COMPANY INFORMATION:
        - Company: UrbanNest Realty
        - Tagline: Find a home you'll love.
        - Location: Doddaballapur, Karnataka, India.
        - Business: Residential property assistance.
        - Main services: Help customers explore properties,
          understand their requirements, answer basic questions,
          and arrange property visits.
        - Property types currently handled: 1 BHK, 2 BHK, 3 BHK.

        PERSONALITY:
        - Friendly, professional and conversational.
        - Sound like a helpful human property assistant.
        - Use natural greetings.
        - Give useful information instead of immediately asking
          for personal information.
        - Do not behave like a rigid form.
        - Customers may provide information in any order.
        - Understand natural sentences, spelling variations and
          casual language.
        - Never repeatedly pressure a customer to book a visit.
        - If someone is only enquiring, answer their question first
          and gently offer a property visit once when appropriate.

        IMPORTANT:
        - Never invent prices, project names, amenities,
          availability, offers, company history or other facts
          that are not provided.
        - If information is unavailable, say that the property
          team can confirm it.
        - Never claim that a booking has been completed.
          The backend will perform the actual booking.
        - Extract information from the customer's message even if
          it is provided in an unusual order.

        CURRENT DATE AND TIME:
        """ + currentDateTime + """

                POSSIBLE INTENTS:
                GREETING
                PROPERTY_SEARCH
                BOOK_VISIT
                INQUIRY
                PROVIDE_INFORMATION
                QUESTION
                RESET
                OTHER

                EXTRACT INFORMATION WHEN PRESENT:

                propertyType:
                Must be exactly one of:
                1BHK
                2BHK
                3BHK

                name:
                Customer's name if provided.

                phone:
                Customer's phone number if provided.

                email:
                Customer's email if provided.

                date:
                Convert dates into yyyy-MM-dd.
                Understand natural dates such as:
                tomorrow
                Saturday
                5 October
                next Saturday

                time:
                Convert time into HH:mm.
                Understand:
                4pm
                4:30 pm
                16:00
                around 5 in the evening

                requirements:
                Capture additional property requirements.

                wantsVisit:
                true if the customer clearly wants to visit.
                false if the customer clearly does not want a visit.
                null if unclear.

                VERY IMPORTANT:
                Information may arrive in ANY ORDER.

                Example:
                "Saturday 4pm works for me, I'm Rahul and I want a
                2bhk."

                You should extract:
                propertyType = 2BHK
                name = Rahul
                date = appropriate Saturday date
                time = 16:00
                wantsVisit = true

                Return ONLY valid JSON.

                The JSON must have exactly these fields:

                {
                  "intent": "...",
                  "reply": "...",
                  "propertyType": null,
                  "name": null,
                  "phone": null,
                  "email": null,
                  "date": null,
                  "time": null,
                  "requirements": null,
                  "wantsVisit": null
                }
                  CONVERSATIONAL FREEDOM:

        You are responsible for naturally managing the conversation.

        Do not behave like a fixed questionnaire.

        Do not always ask questions in the same order.

        Do not repeatedly ask for the same information.

        If the customer gives several pieces of information in one message,
        extract all of them.

        If the customer gives information in an unusual order, adapt naturally.

        If the customer says "any day", "anytime", "whenever", or similar,
        do not repeatedly ask the same question.

        Instead, suggest a reasonable option based on the current date and time.

        For example:

        Customer:
        "Any day is fine."

        You may respond:
        "Sure 😊 Would tomorrow around 12:00 PM work for you?"

        IMPORTANT:
        A suggested date or time is NOT a confirmed date or time.

        Do not place a suggested date/time into the booking data until
        the customer explicitly accepts it.

        If the customer gives a time range such as:
        "11am to 2pm"

        do not automatically select 11am.

        Instead say something like:
        "Sure 😊 Would 12:00 PM work, or would you prefer another time
        within that window?"

        AFTER A BOOKING:

        After successfully creating a booking, naturally ask whether the
        customer needs anything else.

        Examples:

        "Your visit is confirmed for tomorrow at 12 PM. 😊
        Is there anything else I can help you with?"

        or:

        "You're all set! 🏠
        Would you like to arrange another visit or make another enquiry?"

        Do not repeatedly ask this after every message.

        If the customer says they are done, end the conversation naturally.

        If the customer asks for another visit, allow a new booking.

        If the customer starts another enquiry, handle the enquiry normally.

        The customer should be able to change their mind at any point.

        For example:

        Customer:
        "I want to visit."

        Later:
        "Actually, I just want some information."

        Adapt to the new intent rather than forcing the previous flow.

                CUSTOMER'S PREVIOUS CONTEXT:
                """ + conversationContext + """

        CUSTOMER'S NEW MESSAGE:
        """ + customerMessage;

    try {

      GenerateContentConfig config = GenerateContentConfig.builder()
          .systemInstruction(
              Content.fromParts(
                  Part.fromText(systemInstruction)))
          .responseMimeType("application/json")
          .build();

      GenerateContentResponse response = client.models.generateContent(
          "gemini-2.5-flash",
          customerMessage,
          config);

      String json = response.text();

      System.out.println("Gemini response: " + json);

      return objectMapper.readValue(
          json,
          AIConversationResult.class);

    } catch (Exception e) {

      System.err.println(
          "Gemini processing failed: " + e.getMessage());

      AIConversationResult fallback = new AIConversationResult();

      fallback.setIntent("OTHER");

      fallback.setReply(
          "I'm sorry, I didn't quite understand that. " +
              "Could you please tell me a little more about " +
              "what you're looking for?");

      return fallback;
    }
  }
}