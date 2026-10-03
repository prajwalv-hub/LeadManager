import { useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Bookings from "./pages/Bookings";
import Enquiries from "./pages/Enquiries";
import Reports from "./pages/Reports";

function App() {

  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="app-shell">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="app-content">

        {activePage === "dashboard" && (
          <Dashboard />
        )}

        {activePage === "leads" && (
          <Leads />
        )}

        {activePage === "bookings" && (
          <Bookings />
        )}

        {activePage === "enquiries" && (
          <Enquiries />
        )}

        {activePage === "reports" && (
          <Reports />
        )}

      </div>

    </div>
  );
}

export default App;