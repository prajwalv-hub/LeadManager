import "./Sidebar.css";

function Sidebar({ activePage, setActivePage }) {
    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                <div className="brand-logo">L</div>

                <div>
                    <h2>LeadManager</h2>
                    <span>WhatsApp Automation</span>
                </div>
            </div>

            <nav className="sidebar-nav">

                <button
                    className={activePage === "dashboard" ? "nav-item active" : "nav-item"}
                    onClick={() => setActivePage("dashboard")}
                >
                    <span>▦</span>
                    Dashboard
                </button>

                <button
                    className={activePage === "leads" ? "nav-item active" : "nav-item"}
                    onClick={() => setActivePage("leads")}
                >
                    <span>◉</span>
                    Leads
                </button>

                <button
                    className={activePage === "bookings" ? "nav-item active" : "nav-item"}
                    onClick={() => setActivePage("bookings")}
                >
                    <span>□</span>
                    Bookings
                </button>

                <button
                    className={activePage === "enquiries" ? "nav-item active" : "nav-item"}
                    onClick={() => setActivePage("enquiries")}
                >
                    <span>☎</span>
                    Enquiries
                </button>

                <button
                    className={activePage === "reports" ? "nav-item active" : "nav-item"}
                    onClick={() => setActivePage("reports")}
                >
                    <span>▤</span>
                    Reports
                </button>

            </nav>

            <div className="sidebar-bottom">

                <div className="business-card">
                    <div className="business-avatar">
                        U
                    </div>

                    <div>
                        <strong>UrbanNest Realty</strong>
                        <span>Property Management</span>
                    </div>
                </div>

            </div>

        </aside>
    );
}

export default Sidebar;