# LeadManager Frontend (Admin CRM Dashboard)

A modern, responsive React + Vite single-page application providing real-time visibility and management over leads, property visits, enquiries, and sales analytics.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (modular design system with dark sidebar navigation)
- **Charts / Visualizations**: Recharts
- **HTTP Client**: Axios

## Features
- **Dashboard**: High-level KPIs (Total Leads, Visit Bookings, Enquiries, Conversion Rate), lead source charts, property demand distribution, and recent activity feed.
- **Leads**: Complete lead pipeline table with search, status filtering (NEW, CONTACTED, QUALIFIED, VISITED, CONVERTED, LOST), and detailed modal inspection.
- **Bookings**: Schedule and track property visits by customer, property type, preferred date/time, and visit status (PENDING, CONFIRMED, COMPLETED, CANCELLED).
- **Enquiries**: FIFO call queue tracking pending and resolved enquiries with priority handling.
- **Reports**: Analytical reports covering lead source effectiveness, conversion funnels, and property demand patterns.

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation & Development
```bash
# Install dependencies
npm install

# Start local dev server (default port: 5173)
npm run dev
```

The dev server proxies API calls to the Spring Boot backend running on `http://localhost:8080`.
