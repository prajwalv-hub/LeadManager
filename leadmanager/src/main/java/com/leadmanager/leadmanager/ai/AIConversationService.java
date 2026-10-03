package com.leadmanager.leadmanager.ai;

import com.leadmanager.leadmanager.entity.Booking;
import com.leadmanager.leadmanager.entity.Inquiry;
import com.leadmanager.leadmanager.entity.Lead;
import com.leadmanager.leadmanager.repository.BookingRepository;
import com.leadmanager.leadmanager.repository.InquiryRepository;
import com.leadmanager.leadmanager.repository.LeadRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AIConversationService {

    private final GeminiService geminiService;
    private final LeadRepository leadRepository;
    private final BookingRepository bookingRepository;
    private final InquiryRepository inquiryRepository;

    private final Map<String, ConversationContext> conversations = new ConcurrentHashMap<>();

    public AIConversationService(
            GeminiService geminiService,
            LeadRepository leadRepository,
            BookingRepository bookingRepository,
            InquiryRepository inquiryRepository) {
        this.geminiService = geminiService;
        this.leadRepository = leadRepository;
        this.bookingRepository = bookingRepository;
        this.inquiryRepository = inquiryRepository;
    }

    public String processMessage(
            String customerPhone,
            String message) {

        ConversationContext context = conversations.computeIfAbsent(
                customerPhone,
                key -> new ConversationContext());

        String previousContext = buildContext(context);

        AIConversationResult aiResult = geminiService.understand(
                message,
                previousContext);

        merge(context, aiResult);

        /*
         * ============================================================
         * BOOKING FLOW
         * ============================================================
         */

        if (Boolean.TRUE.equals(context.getWantsVisit())
                || "BOOK_VISIT".equalsIgnoreCase(aiResult.getIntent())) {

            if (context.getPropertyType() == null) {
                return "I'd be happy to help arrange a property visit. 😊\n\n"
                        + "Which property are you interested in — "
                        + "1 BHK, 2 BHK or 3 BHK?";
            }

            if (context.getName() == null) {
                return "Perfect! 😊 May I know your name?";
            }

            if (context.getPhone() == null) {
                return "Thanks, " + context.getName()
                        + "! Could you share your phone number?";
            }

            if (context.getEmail() == null) {
                return "Great. Could you also share your email address "
                        + "so we can keep your visit details on record?";
            }

            if (context.getDate() == null) {
                return "What date would you prefer for the property visit?";
            }

            if (context.getTime() == null) {
                return "And what time would work for you?";
            }

            if (!context.isBookingCreated()) {
                return createBooking(
                        customerPhone,
                        context);
            }

            return "Your property visit is already confirmed. 😊";
        }

        /*
         * ============================================================
         * GENERAL ENQUIRY / PROPERTY SEARCH
         * ============================================================
         */

        if ("INQUIRY".equalsIgnoreCase(aiResult.getIntent())
                || "PROPERTY_SEARCH".equalsIgnoreCase(aiResult.getIntent())) {

            if (context.getPropertyType() != null
                    && !context.isInquiryCreated()) {

                /*
                 * Don't immediately force the customer
                 * to provide personal information.
                 */

                if (context.getName() == null) {
                    return aiResult.getReply();
                }

                if (context.getPhone() == null) {
                    return aiResult.getReply()
                            + "\n\nIf you'd like our property team "
                            + "to follow up, you can share your phone number.";
                }

                if (context.getEmail() == null) {
                    return aiResult.getReply()
                            + "\n\nYou can also share your email "
                            + "if you'd like us to keep your enquiry on record.";
                }

                return createInquiry(context);
            }
        }

        /*
         * ============================================================
         * NORMAL AI RESPONSE
         * ============================================================
         */

        if (aiResult.getReply() != null
                && !aiResult.getReply().isBlank()) {

            return aiResult.getReply();
        }

        return "I'd be happy to help. 😊\n\n"
                + "Could you tell me a little more about "
                + "what you're looking for?";
    }

    /*
     * ================================================================
     * MERGE AI INFORMATION INTO CONVERSATION CONTEXT
     * ================================================================
     */

    public void resetConversation(String customerPhone) {
        if (customerPhone != null && !customerPhone.isBlank()) {
            conversations.remove(customerPhone.trim());
        }
    }

    private void merge(
            ConversationContext context,
            AIConversationResult result) {

        if (result.getPropertyType() != null
                && !result.getPropertyType().isBlank()) {

            context.setPropertyType(
                    normalizePropertyType(
                            result.getPropertyType()));
        }

        if (result.getName() != null
                && !result.getName().isBlank()) {

            context.setName(
                    result.getName().trim());
        }

        if (result.getPhone() != null
                && !result.getPhone().isBlank()) {

            context.setPhone(
                    result.getPhone().trim());
        }

        if (result.getEmail() != null
                && !result.getEmail().isBlank()) {

            context.setEmail(
                    result.getEmail().trim());
        }

        if (result.getDate() != null
                && !result.getDate().isBlank()) {

            context.setDate(
                    result.getDate().trim());
        }

        if (result.getTime() != null
                && !result.getTime().isBlank()) {

            context.setTime(
                    result.getTime().trim());
        }

        if (result.getRequirements() != null
                && !result.getRequirements().isBlank()) {

            context.setRequirements(
                    result.getRequirements().trim());
        }

        if (result.getWantsVisit() != null) {

            context.setWantsVisit(
                    result.getWantsVisit());
        }
    }

    /*
     * ================================================================
     * CREATE BOOKING
     * ================================================================
     */

    private String createBooking(
            String customerPhone,
            ConversationContext context) {

        try {

            LocalDate bookingDate = LocalDate.parse(context.getDate());

            LocalTime bookingTime = LocalTime.parse(context.getTime());

            Lead lead = leadRepository
                    .findByPhone(context.getPhone())
                    .orElseGet(() -> {

                        Lead newLead = new Lead();

                        newLead.setName(
                                context.getName());

                        newLead.setPhone(
                                context.getPhone());

                        newLead.setEmail(
                                context.getEmail());

                        newLead.setSource(
                                "WHATSAPP");

                        newLead.setPropertyType(
                                context.getPropertyType());

                        newLead.setRequirements(
                                context.getRequirements());

                        newLead.setPreferredVisitDate(
                                bookingDate);

                        return leadRepository.save(
                                newLead);
                    });

            /*
             * Update existing lead with latest information.
             */

            lead.setName(context.getName());
            lead.setEmail(context.getEmail());
            lead.setPropertyType(context.getPropertyType());
            lead.setRequirements(context.getRequirements());
            lead.setPreferredVisitDate(bookingDate);
            lead.setStatus("VISIT_BOOKED");

            lead = leadRepository.save(lead);

            /*
             * Create booking.
             */

            Booking booking = new Booking();

            booking.setLead(lead);

            booking.setBookingDate(
                    bookingDate);

            booking.setBookingTime(
                    bookingTime);

            booking.setPropertyType(
                    context.getPropertyType());

            bookingRepository.save(booking);

            context.setBookingCreated(true);

            return """
                    🎉 Your property visit has been confirmed!

                    Property: %s
                    Date: %s
                    Time: %s

                    Our UrbanNest Realty team will be ready for you. 🏠

                    Thank you for choosing UrbanNest Realty!
                    """.formatted(
                    context.getPropertyType(),
                    bookingDate,
                    bookingTime);

        } catch (Exception e) {

            System.err.println(
                    "Booking creation failed: "
                            + e.getMessage());

            return "I have all the details I need, but "
                    + "I couldn't complete the booking right now. "
                    + "Please try again in a moment.";
        }
    }

    /*
     * ================================================================
     * CREATE INQUIRY
     * ================================================================
     */

    private String createInquiry(
            ConversationContext context) {

        try {

            Lead lead = leadRepository
                    .findByPhone(context.getPhone())
                    .orElseGet(() -> {

                        Lead newLead = new Lead();

                        newLead.setName(
                                context.getName());

                        newLead.setPhone(
                                context.getPhone());

                        newLead.setEmail(
                                context.getEmail());

                        newLead.setSource(
                                "WHATSAPP");

                        newLead.setPropertyType(
                                context.getPropertyType());

                        newLead.setRequirements(
                                context.getRequirements());

                        return leadRepository.save(
                                newLead);
                    });

            /*
             * Update existing lead.
             */

            lead.setName(context.getName());
            lead.setEmail(context.getEmail());
            lead.setPropertyType(context.getPropertyType());
            lead.setRequirements(context.getRequirements());

            leadRepository.save(lead);

            /*
             * Create enquiry.
             */

            Inquiry inquiry = new Inquiry();

            inquiry.setLead(lead);

            inquiryRepository.save(inquiry);

            context.setInquiryCreated(true);

            return """
                    Thanks! 😊

                    I've recorded your enquiry.

                    Our UrbanNest Realty property team can get in touch
                    with you regarding your requirements.
                    """;

        } catch (Exception e) {

            System.err.println(
                    "Inquiry creation failed: "
                            + e.getMessage());

            return "I couldn't save the enquiry right now. "
                    + "Please try again in a moment.";
        }
    }

    /*
     * ================================================================
     * BUILD CONTEXT FOR GEMINI
     * ================================================================
     */

    private String buildContext(
            ConversationContext context) {

        return """
                propertyType=%s
                name=%s
                phone=%s
                email=%s
                date=%s
                time=%s
                requirements=%s
                wantsVisit=%s
                bookingCreated=%s
                inquiryCreated=%s
                """.formatted(

                value(context.getPropertyType()),
                value(context.getName()),
                value(context.getPhone()),
                value(context.getEmail()),
                value(context.getDate()),
                value(context.getTime()),
                value(context.getRequirements()),
                context.getWantsVisit(),
                context.isBookingCreated(),
                context.isInquiryCreated());
    }

    private String value(String value) {

        return value == null
                ? "unknown"
                : value;
    }

    /*
     * ================================================================
     * PROPERTY TYPE NORMALIZATION
     * ================================================================
     */

    private String normalizePropertyType(
            String propertyType) {

        String value = propertyType
                .trim()
                .toUpperCase()
                .replace(" ", "");

        if (value.equals("1BHK")) {
            return "1BHK";
        }

        if (value.equals("2BHK")) {
            return "2BHK";
        }

        if (value.equals("3BHK")) {
            return "3BHK";
        }

        return propertyType.trim();
    }
}