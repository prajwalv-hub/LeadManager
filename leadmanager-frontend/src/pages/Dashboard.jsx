import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import "./Dashboard.css";

const API = "http://localhost:8080/api";

function Dashboard() {

    // =========================================
    // STATE
    // =========================================

    const [analytics, setAnalytics] = useState({
        totalLeads: 0,
        totalVisits: 0,
        totalEnquiries: 0,
        leadsBySource: {},
        leadsByProperty: {},
        leadsByStatus: {},
        leadsOverTime: [],
    });

    const [bookings, setBookings] = useState([]);
    const [recentLeads, setRecentLeads] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [lastUpdated, setLastUpdated] = useState(null);


    // =========================================
    // INITIAL LOAD
    // =========================================

    useEffect(() => {
        loadDashboard();
    }, []);


    // =========================================
    // LOAD ALL DASHBOARD DATA
    // =========================================

    const loadDashboard = async () => {

        try {

            setRefreshing(true);

            const [
                analyticsResponse,
                bookingsResponse,
                leadsResponse,
            ] = await Promise.all([

                axios.get(`${API}/analytics`),

                axios.get(`${API}/bookings`),

                axios.get(`${API}/leads`),

            ]);


            setAnalytics(analyticsResponse.data);

            setBookings(bookingsResponse.data);

            setRecentLeads(leadsResponse.data);

            setLastUpdated(new Date());

        } catch (error) {

            console.error(
                "Failed to load dashboard:",
                error
            );

        } finally {

            setLoading(false);

            setRefreshing(false);
        }
    };


    // =========================================
    // DATE FILTER
    // =========================================

    const applyFilter = async () => {

        if (!fromDate || !toDate) {

            alert("Please select both dates.");

            return;
        }


        if (fromDate > toDate) {

            alert(
                "From date cannot be after To date."
            );

            return;
        }


        try {

            setRefreshing(true);


            const response = await axios.get(
                `${API}/analytics?from=${fromDate}&to=${toDate}`
            );


            setAnalytics(response.data);

            setLastUpdated(new Date());

        } catch (error) {

            console.error(
                "Failed to filter analytics:",
                error
            );

        } finally {

            setRefreshing(false);
        }
    };


    // =========================================
    // CLEAR FILTER
    // =========================================

    const clearFilter = () => {

        setFromDate("");

        setToDate("");

        loadDashboard();
    };


    // =========================================
    // SOURCE DATA
    // =========================================

    const sourceData = useMemo(() => {

        return Object.entries(
            analytics.leadsBySource || {}
        )
            .map(([name, value]) => ({

                name,

                value,

            }))
            .sort(
                (a, b) =>
                    b.value - a.value
            );

    }, [analytics.leadsBySource]);


    // =========================================
    // DISPLAY SOURCE NAME
    // =========================================

    const formatSourceName = (source) => {

        if (source === "WHATSAPP") {
            return "WhatsApp";
        }

        if (source === "GOOGLE_FORM") {
            return "Google Form";
        }

        return source
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };


    // =========================================
    // PROPERTY DATA
    //
    // 1BHK + 1 BHK -> 1 BHK
    // 2BHK + 2 BHK -> 2 BHK
    // 3BHK + 3 BHK -> 3 BHK
    // =========================================

    const propertyData = useMemo(() => {

        const normalized = {};


        Object.entries(
            analytics.leadsByProperty || {}
        ).forEach(([name, value]) => {

            const cleanName = name
                .replace(/\s+/g, "")
                .toUpperCase();


            let propertyName = name;


            if (cleanName === "1BHK") {

                propertyName = "1 BHK";

            } else if (cleanName === "2BHK") {

                propertyName = "2 BHK";

            } else if (cleanName === "3BHK") {

                propertyName = "3 BHK";
            }


            normalized[propertyName] =
                (normalized[propertyName] || 0) +
                value;

        });


        return Object.entries(normalized)

            .map(([name, value]) => ({
                name,
                value,
            }))

            .sort(
                (a, b) =>
                    b.value - a.value
            );

    }, [analytics.leadsByProperty]);


    // =========================================
    // STATUS DATA
    // =========================================

    const statusData = useMemo(() => {

        const statusOrder = [

            "NEW",

            "CONTACTED",

            "INTERESTED",

            "VISIT_BOOKED",

            "VISIT_COMPLETED",

            "CONVERTED",

            "NOT_INTERESTED",

        ];


        return statusOrder.map((status) => ({

            name: status,

            value:
                analytics.leadsByStatus?.[status] ||
                0,

        }));

    }, [analytics.leadsByStatus]);


    // =========================================
    // VISIT RATE
    // =========================================

    const visitRate =
        analytics.totalLeads > 0

            ? (
                (
                    analytics.totalVisits /
                    analytics.totalLeads
                ) * 100
            ).toFixed(1)

            : "0.0";


    // =========================================
    // LEADS OVER TIME
    // =========================================

    const leadsOverTime =
        analytics.leadsOverTime || [];


    // =========================================
    // UPCOMING VISITS
    // =========================================

    const upcomingVisits = useMemo(() => {

        const today = new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        return [...bookings]

            .filter((booking) => {

                if (!booking.bookingDate) {
                    return false;
                }


                const bookingDate =
                    new Date(
                        `${booking.bookingDate}T00:00:00`
                    );


                return bookingDate >= today;

            })

            .sort((a, b) => {

                const dateA =
                    new Date(
                        `${a.bookingDate}T${a.bookingTime ||
                        "00:00:00"
                        }`
                    );


                const dateB =
                    new Date(
                        `${b.bookingDate}T${b.bookingTime ||
                        "00:00:00"
                        }`
                    );


                return dateA - dateB;

            })

            .slice(0, 10);

    }, [bookings]);


    // =========================================
    // RECENT ACTIVITY
    // =========================================

    const recentActivity = useMemo(() => {

        const activities = [];


        // -------------------------------
        // LEADS
        // -------------------------------

        recentLeads.forEach((lead) => {

            if (!lead.createdAt) {
                return;
            }


            activities.push({

                type: "lead",

                name:
                    lead.name ||
                    "Unknown customer",

                phone: lead.phone,

                date:
                    new Date(
                        lead.createdAt
                    ),

                status: lead.status,

            });

        });


        // -------------------------------
        // BOOKINGS
        // -------------------------------

        bookings.forEach((booking) => {

            if (!booking.createdAt) {
                return;
            }


            activities.push({

                type: "booking",

                name:
                    booking.lead?.name ||
                    "Unknown customer",

                phone:
                    booking.lead?.phone,

                date:
                    new Date(
                        booking.createdAt
                    ),

                status:
                    booking.status,

            });

        });


        return activities

            .sort(
                (a, b) =>
                    b.date - a.date
            )

            .slice(0, 10);

    }, [recentLeads, bookings]);


    // =========================================
    // MAX VALUES
    // =========================================

    const maxSource =
        sourceData.length > 0

            ? Math.max(
                ...sourceData.map(
                    (item) => item.value
                )
            )

            : 1;


    const maxProperty =
        propertyData.length > 0

            ? Math.max(
                ...propertyData.map(
                    (item) => item.value
                )
            )

            : 1;


    // =========================================
    // RELATIVE TIME
    // =========================================

    const formatRelativeTime = (date) => {

        const now = new Date();


        const difference =
            Math.floor(
                (now - date) / 1000
            );


        if (difference < 60) {

            return "Just now";
        }


        if (difference < 3600) {

            const minutes =
                Math.floor(
                    difference / 60
                );

            return `${minutes} min ago`;
        }


        if (difference < 86400) {

            const hours =
                Math.floor(
                    difference / 3600
                );

            return `${hours} hr ago`;
        }


        const days =
            Math.floor(
                difference / 86400
            );


        return `${days} day${days !== 1 ? "s" : ""
            } ago`;
    };


    // =========================================
    // LAST UPDATED
    // =========================================

    const formattedLastUpdated =
        lastUpdated

            ? lastUpdated.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            )

            : "--:--";


    // =========================================
    // LOADING SCREEN
    // =========================================

    if (loading) {

        return (

            <div className="dashboard-loading-screen">

                <div className="dashboard-loader"></div>

                <span>
                    Loading dashboard...
                </span>

            </div>
        );
    }


    // =========================================
    // DASHBOARD
    // =========================================

    return (

        <div className="dashboard-page">


            {/* =========================================
                TOP HEADER
            ========================================= */}

            <header className="dashboard-topbar">

                <div>

                    <div className="dashboard-eyebrow">
                        BUSINESS OVERVIEW
                    </div>


                    <h1>
                        Dashboard
                    </h1>


                    <p>
                        Monitor leads, enquiries and
                        property activity in one place.
                    </p>

                </div>


                <div className="dashboard-top-actions">


                    <div className="live-status">

                        <span className="live-dot"></span>

                        <span>
                            System Online
                        </span>

                    </div>


                    <div className="last-updated">

                        Updated{" "}
                        {formattedLastUpdated}

                    </div>


                    <button
                        className="refresh-btn"
                        onClick={loadDashboard}
                        disabled={refreshing}
                    >

                        <span
                            className={
                                refreshing
                                    ? "refresh-icon spinning"
                                    : "refresh-icon"
                            }
                        >
                            ↻
                        </span>


                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>

                </div>

            </header>



            {/* =========================================
                FILTER
            ========================================= */}

            <section className="dashboard-filter">


                <div className="filter-heading">

                    <span className="filter-icon">
                        ◷
                    </span>


                    <div>

                        <strong>
                            Date Range
                        </strong>

                        <span>
                            View analytics for a
                            specific period
                        </span>

                    </div>

                </div>


                <div className="filter-controls">


                    <div className="dashboard-date-field">

                        <label>
                            From
                        </label>


                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) =>
                                setFromDate(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="dashboard-date-field">

                        <label>
                            To
                        </label>


                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) =>
                                setToDate(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <button
                        className="filter-apply"
                        onClick={applyFilter}
                    >
                        Apply
                    </button>


                    <button
                        className="filter-clear"
                        onClick={clearFilter}
                    >
                        Clear
                    </button>

                </div>

            </section>



            {/* =========================================
                KPI CARDS
            ========================================= */}

            <section className="dashboard-kpis">


                {/* TOTAL LEADS */}

                <div className="kpi-card">

                    <div className="kpi-top">

                        <div className="kpi-icon leads-icon">
                            ↗
                        </div>

                        <span className="kpi-label">
                            TOTAL LEADS
                        </span>

                    </div>


                    <div className="kpi-value">
                        {analytics.totalLeads}
                    </div>


                    <div className="kpi-description">
                        Customers captured
                    </div>

                </div>



                {/* VISITS */}

                <div className="kpi-card">

                    <div className="kpi-top">

                        <div className="kpi-icon visits-icon">
                            ◷
                        </div>

                        <span className="kpi-label">
                            VISITS BOOKED
                        </span>

                    </div>


                    <div className="kpi-value">
                        {analytics.totalVisits}
                    </div>


                    <div className="kpi-description">
                        Property visits scheduled
                    </div>

                </div>



                {/* ENQUIRIES */}

                <div className="kpi-card">

                    <div className="kpi-top">

                        <div className="kpi-icon enquiries-icon">
                            ?
                        </div>

                        <span className="kpi-label">
                            ENQUIRIES
                        </span>

                    </div>


                    <div className="kpi-value">
                        {analytics.totalEnquiries}
                    </div>


                    <div className="kpi-description">
                        Customer enquiries received
                    </div>

                </div>



                {/* VISIT RATE */}

                <div className="kpi-card">

                    <div className="kpi-top">

                        <div className="kpi-icon rate-icon">
                            %
                        </div>

                        <span className="kpi-label">
                            VISIT RATE
                        </span>

                    </div>


                    <div className="kpi-value">
                        {visitRate}%
                    </div>


                    <div className="kpi-description">
                        Visits relative to leads
                    </div>

                </div>

            </section>



            {/* =========================================
                MAIN ANALYTICS
            ========================================= */}

            <section className="dashboard-main-grid">


                {/* =====================================
                    LEAD ACTIVITY
                ===================================== */}

                <div className="dashboard-panel activity-panel">


                    <div className="panel-header">

                        <div>

                            <span className="panel-kicker">
                                LEAD ACTIVITY
                            </span>


                            <h2>
                                Leads generated
                            </h2>


                            <p>
                                Daily lead volume captured
                                by the platform
                            </p>

                        </div>


                        <div className="panel-total">

                            <strong>
                                {analytics.totalLeads}
                            </strong>

                            <span>
                                Total
                            </span>

                        </div>

                    </div>



                    <div className="activity-chart">

                        {leadsOverTime.length === 0 ? (

                            <div className="chart-empty">

                                No lead activity
                                for this period.

                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height={330}
                            >

                                <AreaChart
                                    data={leadsOverTime}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -15,
                                        bottom: 0,
                                    }}
                                >

                                    <defs>

                                        <linearGradient
                                            id="leadGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >

                                            <stop
                                                offset="0%"
                                                stopColor="#2563eb"
                                                stopOpacity={0.22}
                                            />

                                            <stop
                                                offset="100%"
                                                stopColor="#2563eb"
                                                stopOpacity={0}
                                            />

                                        </linearGradient>

                                    </defs>


                                    <CartesianGrid
                                        stroke="#eef1f5"
                                        vertical={false}
                                    />


                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#98a2b3",
                                            fontSize: 12,
                                        }}
                                    />


                                    <YAxis
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#98a2b3",
                                            fontSize: 12,
                                        }}
                                    />


                                    <Tooltip
                                        contentStyle={{
                                            border:
                                                "1px solid #e5e7eb",
                                            borderRadius:
                                                "10px",
                                            boxShadow:
                                                "0 8px 24px rgba(15, 23, 42, 0.08)",
                                        }}
                                        labelStyle={{
                                            color: "#344054",
                                            fontWeight: 600,
                                        }}
                                    />


                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        fill="url(#leadGradient)"
                                        dot={{
                                            r: 4,
                                            fill: "#ffffff",
                                            stroke: "#2563eb",
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{
                                            r: 6,
                                        }}
                                    />

                                </AreaChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>



                {/* =====================================
                    LEAD SOURCES
                ===================================== */}

                <div className="dashboard-panel source-panel">


                    <div className="panel-header">

                        <div>

                            <span className="panel-kicker">
                                ACQUISITION
                            </span>


                            <h2>
                                Lead sources
                            </h2>


                            <p>
                                Where your customers
                                are coming from
                            </p>

                        </div>

                    </div>



                    <div className="source-list">

                        {sourceData.length === 0 ? (

                            <div className="chart-empty">

                                No source data
                                available.

                            </div>

                        ) : (

                            sourceData.map((source) => {

                                const percentage =
                                    analytics.totalLeads > 0

                                        ? (
                                            (
                                                source.value /
                                                analytics.totalLeads
                                            ) * 100
                                        ).toFixed(0)

                                        : 0;


                                const width =
                                    (
                                        source.value /
                                        maxSource
                                    ) * 100;


                                return (

                                    <div
                                        className="source-item"
                                        key={source.name}
                                    >


                                        <div className="source-row">

                                            <div className="source-name">

                                                <span className="source-indicator"></span>

                                                <span>
                                                    {formatSourceName(
                                                        source.name
                                                    )}
                                                </span>

                                            </div>


                                            <div className="source-value">

                                                <strong>
                                                    {source.value}
                                                </strong>

                                                <span>
                                                    {percentage}%
                                                </span>

                                            </div>

                                        </div>


                                        <div className="source-track">

                                            <div
                                                className="source-progress"
                                                style={{
                                                    width:
                                                        `${width}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                );

                            })

                        )}

                    </div>

                </div>

            </section>



            {/* =========================================
                PROPERTY + STATUS
            ========================================= */}

            <section className="dashboard-secondary-grid">


                {/* PROPERTY DEMAND */}

                <div className="dashboard-panel">


                    <div className="panel-header">

                        <div>

                            <span className="panel-kicker">
                                CUSTOMER DEMAND
                            </span>


                            <h2>
                                Property demand
                            </h2>


                            <p>
                                Preferred property types
                                from your leads
                            </p>

                        </div>

                    </div>



                    <div className="property-list">

                        {propertyData.length === 0 ? (

                            <div className="chart-empty">

                                No property data
                                available.

                            </div>

                        ) : (

                            propertyData.map((property) => {

                                const width =
                                    (
                                        property.value /
                                        maxProperty
                                    ) * 100;


                                const percentage =
                                    analytics.totalLeads > 0

                                        ? (
                                            (
                                                property.value /
                                                analytics.totalLeads
                                            ) * 100
                                        ).toFixed(0)

                                        : 0;


                                return (

                                    <div
                                        className="property-item"
                                        key={property.name}
                                    >

                                        <div className="property-heading">

                                            <span>
                                                {property.name}
                                            </span>


                                            <div>

                                                <strong>
                                                    {property.value}
                                                </strong>

                                                <small>
                                                    {percentage}%
                                                </small>

                                            </div>

                                        </div>


                                        <div className="property-track">

                                            <div
                                                className="property-progress"
                                                style={{
                                                    width:
                                                        `${width}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                );

                            })

                        )}

                    </div>

                </div>



                {/* STATUS */}

                <div className="dashboard-panel">


                    <div className="panel-header">

                        <div>

                            <span className="panel-kicker">
                                PIPELINE
                            </span>


                            <h2>
                                Lead status
                            </h2>


                            <p>
                                Current distribution
                                of your leads
                            </p>

                        </div>

                    </div>



                    <div className="status-list">

                        {statusData
                            .filter(
                                (item) =>
                                    item.value > 0
                            )
                            .map((item) => (

                                <div
                                    className="status-row"
                                    key={item.name}
                                >

                                    <div className="status-name">

                                        <span
                                            className={
                                                `status-dot status-${item.name.toLowerCase()}`
                                            }
                                        ></span>


                                        <span>
                                            {item.name
                                                .replaceAll(
                                                    "_",
                                                    " "
                                                )
                                                .toLowerCase()
                                                .replace(
                                                    /\b\w/g,
                                                    (char) =>
                                                        char.toUpperCase()
                                                )}
                                        </span>

                                    </div>


                                    <strong>
                                        {item.value}
                                    </strong>

                                </div>

                            ))}


                        {statusData.filter(
                            (item) =>
                                item.value > 0
                        ).length === 0 && (

                                <div className="chart-empty">

                                    No lead status
                                    data available.

                                </div>

                            )}

                    </div>

                </div>

            </section>



            {/* =========================================
                OPERATIONS
            ========================================= */}

            <section className="dashboard-operations">


                {/* =====================================
                    UPCOMING VISITS
                ===================================== */}

                <div className="dashboard-panel">


                    <div className="panel-header">

                        <div>

                            <span className="panel-kicker">
                                SCHEDULE
                            </span>


                            <h2>
                                Upcoming visits
                            </h2>


                            <p>
                                Next property visits
                                scheduled
                            </p>

                        </div>


                        <span className="panel-link">
                            View all →
                        </span>

                    </div>



                    <div className="visit-list">

                        {upcomingVisits.length === 0 ? (

                            <div className="empty-operation">

                                No upcoming visits.

                            </div>

                        ) : (

                            upcomingVisits.map(
                                (booking) => (

                                    <div
                                        className="visit-item"
                                        key={booking.id}
                                    >


                                        <div className="visit-date">

                                            <strong>

                                                {new Date(
                                                    `${booking.bookingDate}T00:00:00`
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                    }
                                                )}

                                            </strong>


                                            <span>
                                                {booking.bookingTime ||
                                                    "--"}
                                            </span>

                                        </div>



                                        <div className="visit-customer">

                                            <strong>
                                                {booking.lead?.name ||
                                                    "Unknown"}
                                            </strong>


                                            <span>
                                                {booking.lead?.propertyType ||
                                                    "Property"}
                                            </span>

                                        </div>



                                        <span className="booking-status">

                                            {booking.status ||
                                                "CONFIRMED"}

                                        </span>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>



                {/* =====================================
                    RECENT ACTIVITY
                ===================================== */}

                <div className="dashboard-panel">


                    <div className="panel-header">

                        <div>

                            <span className="panel-kicker">
                                ACTIVITY
                            </span>


                            <h2>
                                Recent activity
                            </h2>


                            <p>
                                Latest customer actions
                            </p>

                        </div>

                    </div>



                    <div className="activity-list">

                        {recentActivity.length === 0 ? (

                            <div className="empty-operation">

                                No recent activity.

                            </div>

                        ) : (

                            recentActivity.map(
                                (activity, index) => (

                                    <div
                                        className="activity-item"
                                        key={
                                            `${activity.type}-${activity.date.getTime()}-${index}`
                                        }
                                    >


                                        <div
                                            className={
                                                activity.type === "lead"
                                                    ? "activity-dot lead-activity"
                                                    : "activity-dot booking-activity"
                                            }
                                        ></div>



                                        <div className="activity-content">

                                            <strong>

                                                {activity.type === "lead"
                                                    ? "New lead received"
                                                    : "Property visit booked"}

                                            </strong>


                                            <span>
                                                {activity.name}
                                            </span>

                                        </div>



                                        <time>
                                            {formatRelativeTime(
                                                activity.date
                                            )}
                                        </time>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            </section>



            {/* =========================================
                BUSINESS SNAPSHOT
            ========================================= */}

            <section className="dashboard-summary">


                <div className="summary-icon">
                    ✦
                </div>


                <div className="summary-content">


                    <span>
                        BUSINESS SNAPSHOT
                    </span>


                    <strong>

                        {analytics.totalLeads} leads
                        captured from{" "}
                        {sourceData.length} active source
                        {sourceData.length !== 1
                            ? "s"
                            : ""}.

                    </strong>


                    <p>

                        {analytics.totalVisits} property
                        visits have been booked, while{" "}
                        {analytics.totalEnquiries} enquiries
                        have been recorded in the selected
                        period.

                    </p>

                </div>

            </section>

        </div>
    );
}

export default Dashboard;