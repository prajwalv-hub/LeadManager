# UrbanNest Chat (Customer AI Assistant)

A responsive, WhatsApp-style customer chat interface designed for conversational property discovery, automated lead capture, and instant visit scheduling.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (WhatsApp web-style layout and chat bubbles)
- **HTTP Client**: Axios

## Features
- **Conversational Lead Qualification**: Connects directly to backend Gemini AI services to naturally extract customer name, phone number, email, and property preferences.
- **Automated Visit Booking**: Guides customers through selecting preferred dates, times, and property types for real estate visits.
- **Instant CRM Sync**: Automatically populates leads, bookings, and enquiries directly into the LeadManager CRM backend in real time.
- **WhatsApp Simulation**: Emulates chat statuses, read receipts, and automated business replies.

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation & Development
```bash
# Install dependencies
npm install

# Start local dev server (configured on port 5174)
npm run dev
```

The dev server proxies `/api` calls to the Spring Boot backend running on `http://localhost:8080`.
