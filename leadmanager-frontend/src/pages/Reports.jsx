import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Reports.css";

const API = "http://localhost:8080/api";

function Reports() {
    const [analytics, setAnalytics] = useState(null);
    const [leads, setLeads] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [inquiries, setInquiries] = useState([]);

    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        try {
            setLoading(true);

            const analyticsUrl =
                fromDate && toDate
                    ? `${API}/analytics?from=${fromDate}&to=${toDate}`
                    : `${API}/analytics`;

            const [
                analyticsResponse,
                leadsResponse,
                bookingsResponse,
                inquiriesResponse,
            ] = await Promise.all([
                axios.get(analyticsUrl),
                axios.get(`${API}/leads`),
                axios.get(`${API}/bookings`),
                axios.get(`${API}/inquiries`),
            ]);

            setAnalytics(analyticsResponse.data);
            setLeads(leadsResponse.data);
            setBookings(bookingsResponse.data);
            setInquiries(inquiriesResponse.data);
        } catch (error) {
            console.error("Failed to load report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilter = () => {
        loadReport();
    };

    const clearFilter = () => {
        setFromDate("");
        setToDate("");

        setTimeout(() => {
            loadReport();
        }, 0);
    };

    const totalLeads = analytics?.totalLeads || 0;
    const totalVisits = analytics?.totalVisits || 0;
    const totalEnquiries = analytics?.totalEnquiries || 0;

    const visitRate =
        totalLeads > 0
            ? ((totalVisits / totalLeads) * 100).toFixed(1)
            : "0.0";

    const conversionRate =
        totalLeads > 0
            ? (
                (leads.filter(
                    (lead) => lead.status === "CONVERTED"
                ).length /
                    totalLeads) *
                100
            ).toFixed(1)
            : "0.0";

    const confirmedBookings = bookings.filter(
        (booking) => booking.status === "CONFIRMED"
    ).length;

    const completedBookings = bookings.filter(
        (booking) => booking.status === "COMPLETED"
    ).length;

    const cancelledBookings = bookings.filter(
        (booking) => booking.status === "CANCELLED"
    ).length;

    const pendingEnquiries = inquiries.filter(
        (inquiry) => inquiry.status === "PENDING"
    ).length;

    const interestedEnquiries = inquiries.filter(
        (inquiry) => inquiry.status === "INTERESTED"
    ).length;

    const sourceData = useMemo(() => {
        if (!analytics?.leadsBySource) return [];

        return Object.entries(analytics.leadsBySource).map(
            ([source, count]) => ({
                source: source
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (letter) =>
                        letter.toUpperCase()
                    ),
                count,
                percentage:
                    totalLeads > 0
                        ? ((count / totalLeads) * 100).toFixed(1)
                        : 0,
            })
        );
    }, [analytics, totalLeads]);

    const propertyData = useMemo(() => {
        if (!analytics?.leadsByProperty) return [];

        const normalized = {};

        Object.entries(
            analytics.leadsByProperty
        ).forEach(([property, count]) => {
            const cleanProperty = property
                .replace(/\s+/g, "")
                .toUpperCase()
                .replace("BHK", " BHK");

            normalized[cleanProperty] =
                (normalized[cleanProperty] || 0) + count;
        });

        return Object.entries(normalized)
            .map(([property, count]) => ({
                property,
                count,
                percentage:
                    totalLeads > 0
                        ? ((count / totalLeads) * 100).toFixed(1)
                        : 0,
            }))
            .sort((a, b) => b.count - a.count);
    }, [analytics, totalLeads]);

    const statusData = useMemo(() => {
        if (!analytics?.leadsByStatus) return [];

        return Object.entries(
            analytics.leadsByStatus
        )
            .map(([status, count]) => ({
                status: status
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (letter) =>
                        letter.toUpperCase()
                    ),
                count,
                percentage:
                    totalLeads > 0
                        ? ((count / totalLeads) * 100).toFixed(1)
                        : 0,
            }))
            .sort((a, b) => b.count - a.count);
    }, [analytics, totalLeads]);

    const exportSummary = () => {
        const report = `
LEADMANAGER BUSINESS REPORT

Date Range:
${fromDate || "All time"} - ${toDate || "Today"}

OVERVIEW
Total Leads: ${totalLeads}
Visits Booked: ${totalVisits}
Enquiries: ${totalEnquiries}
Visit Rate: ${visitRate}%
Conversion Rate: ${conversionRate}%

BOOKINGS
Confirmed: ${confirmedBookings}
Completed: ${completedBookings}
Cancelled: ${cancelledBookings}

ENQUIRIES
Pending: ${pendingEnquiries}
Interested: ${interestedEnquiries}

LEADS BY SOURCE
${sourceData
                .map(
                    (item) =>
                        `${item.source}: ${item.count} (${item.percentage}%)`
                )
                .join("\n")}

PROPERTY DEMAND
${propertyData
                .map(
                    (item) =>
                        `${item.property}: ${item.count} (${item.percentage}%)`
                )
                .join("\n")}

LEAD STATUS
${statusData
                .map(
                    (item) =>
                        `${item.status}: ${item.count} (${item.percentage}%)`
                )
                .join("\n")}
`;

        const blob = new Blob([report], {
            type: "text/plain",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "leadmanager-report.txt";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="reports-loading">
                <div className="reports-loader"></div>
                Loading report...
            </div>
        );
    }

    return (
        <div className="reports-page">

            {/* HEADER */}

            <header className="reports-header">

                <div>
                    <span className="reports-eyebrow">
                        BUSINESS INTELLIGENCE
                    </span>

                    <h1>Reports</h1>

                    <p>
                        Understand lead performance,
                        demand and customer activity.
                    </p>
                </div>

                <div className="reports-actions">

                    <button
                        className="report-secondary-button"
                        onClick={loadReport}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="report-primary-button"
                        onClick={exportSummary}
                    >
                        ↓ Export Report
                    </button>

                </div>

            </header>


            {/* DATE FILTER */}

            <section className="report-filter">

                <div>
                    <label>FROM</label>

                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) =>
                            setFromDate(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>TO</label>

                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) =>
                            setToDate(e.target.value)
                        }
                    />
                </div>

                <button
                    className="apply-filter"
                    onClick={handleApplyFilter}
                >
                    Apply
                </button>

                <button
                    className="clear-filter"
                    onClick={clearFilter}
                >
                    Clear
                </button>

            </section>


            {/* OVERVIEW */}

            <section className="report-section">

                <div className="section-heading">
                    <div>
                        <h2>Business Overview</h2>
                        <p>
                            Key performance indicators for the
                            selected period.
                        </p>
                    </div>
                </div>


                <div className="report-kpis">

                    <div className="report-kpi">
                        <span>Total Leads</span>
                        <strong>{totalLeads}</strong>
                        <small>Customers captured</small>
                    </div>

                    <div className="report-kpi">
                        <span>Visits Booked</span>
                        <strong>{totalVisits}</strong>
                        <small>Property visits</small>
                    </div>

                    <div className="report-kpi">
                        <span>Enquiries</span>
                        <strong>{totalEnquiries}</strong>
                        <small>Customers requiring follow-up</small>
                    </div>

                    <div className="report-kpi">
                        <span>Visit Rate</span>
                        <strong>{visitRate}%</strong>
                        <small>Leads → visits</small>
                    </div>

                </div>

            </section>


            {/* SOURCE + PROPERTY */}

            <section className="report-grid">

                <div className="report-card">

                    <div className="report-card-header">
                        <div>
                            <h3>Lead Sources</h3>
                            <p>Where your customers come from.</p>
                        </div>
                    </div>

                    <div className="report-bars">

                        {sourceData.length === 0 ? (
                            <div className="report-empty">
                                No source data available.
                            </div>
                        ) : (
                            sourceData.map((item) => (
                                <div
                                    className="report-bar-row"
                                    key={item.source}
                                >

                                    <div className="bar-label">
                                        <span>{item.source}</span>
                                        <strong>
                                            {item.count}
                                        </strong>
                                    </div>

                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${item.percentage}%`,
                                            }}
                                        ></div>
                                    </div>

                                    <small>
                                        {item.percentage}%
                                    </small>

                                </div>
                            ))
                        )}

                    </div>

                </div>


                <div className="report-card">

                    <div className="report-card-header">
                        <div>
                            <h3>Property Demand</h3>
                            <p>What customers are looking for.</p>
                        </div>
                    </div>

                    <div className="report-bars">

                        {propertyData.length === 0 ? (
                            <div className="report-empty">
                                No property data available.
                            </div>
                        ) : (
                            propertyData.map((item) => (
                                <div
                                    className="report-bar-row"
                                    key={item.property}
                                >

                                    <div className="bar-label">
                                        <span>{item.property}</span>
                                        <strong>
                                            {item.count}
                                        </strong>
                                    </div>

                                    <div className="bar-track">
                                        <div
                                            className="bar-fill property"
                                            style={{
                                                width: `${item.percentage}%`,
                                            }}
                                        ></div>
                                    </div>

                                    <small>
                                        {item.percentage}%
                                    </small>

                                </div>
                            ))
                        )}

                    </div>

                </div>

            </section>


            {/* BOOKINGS + ENQUIRIES */}

            <section className="report-grid">

                <div className="report-card">

                    <div className="report-card-header">
                        <div>
                            <h3>Booking Performance</h3>
                            <p>Current property visit activity.</p>
                        </div>
                    </div>

                    <div className="metric-list">

                        <div className="metric-item">
                            <span>Confirmed</span>
                            <strong>
                                {confirmedBookings}
                            </strong>
                        </div>

                        <div className="metric-item">
                            <span>Completed</span>
                            <strong>
                                {completedBookings}
                            </strong>
                        </div>

                        <div className="metric-item">
                            <span>Cancelled</span>
                            <strong>
                                {cancelledBookings}
                            </strong>
                        </div>

                        <div className="metric-item total">
                            <span>Total Bookings</span>
                            <strong>
                                {bookings.length}
                            </strong>
                        </div>

                    </div>

                </div>


                <div className="report-card">

                    <div className="report-card-header">
                        <div>
                            <h3>Enquiry Pipeline</h3>
                            <p>Customer follow-up activity.</p>
                        </div>
                    </div>

                    <div className="metric-list">

                        <div className="metric-item">
                            <span>Pending</span>
                            <strong>
                                {pendingEnquiries}
                            </strong>
                        </div>

                        <div className="metric-item">
                            <span>Interested</span>
                            <strong>
                                {interestedEnquiries}
                            </strong>
                        </div>

                        <div className="metric-item">
                            <span>Total Enquiries</span>
                            <strong>
                                {inquiries.length}
                            </strong>
                        </div>

                        <div className="metric-item total">
                            <span>Conversion Rate</span>
                            <strong>
                                {conversionRate}%
                            </strong>
                        </div>

                    </div>

                </div>

            </section>


            {/* STATUS */}

            <section className="report-card status-card">

                <div className="report-card-header">
                    <div>
                        <h3>Lead Pipeline</h3>
                        <p>
                            Current distribution of your leads.
                        </p>
                    </div>
                </div>

                <div className="status-grid">

                    {statusData.length === 0 ? (
                        <div className="report-empty">
                            No status data available.
                        </div>
                    ) : (
                        statusData.map((item) => (
                            <div
                                className="status-item"
                                key={item.status}
                            >

                                <div className="status-top">
                                    <span>{item.status}</span>
                                    <strong>{item.count}</strong>
                                </div>

                                <div className="status-track">
                                    <div
                                        className="status-fill"
                                        style={{
                                            width: `${item.percentage}%`,
                                        }}
                                    ></div>
                                </div>

                                <small>
                                    {item.percentage}% of leads
                                </small>

                            </div>
                        ))
                    )}

                </div>

            </section>

        </div>
    );
}

export default Reports;