import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Bookings.css";

const API = "http://localhost:8080/api";

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("ALL");

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);

            const response = await axios.get(`${API}/bookings`);

            setBookings(response.data);
        } catch (error) {
            console.error("Failed to load bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return bookings.filter((booking) => {
            const name = booking.lead?.name || "";
            const phone = booking.lead?.phone || "";
            const email = booking.lead?.email || "";
            const property = booking.lead?.propertyType || "";

            const searchText = search.toLowerCase();

            const matchesSearch =
                !search ||
                name.toLowerCase().includes(searchText) ||
                phone.toLowerCase().includes(searchText) ||
                email.toLowerCase().includes(searchText) ||
                property.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "ALL" ||
                booking.status === statusFilter;

            let matchesDate = true;

            if (dateFilter !== "ALL" && booking.bookingDate) {
                const bookingDate = new Date(
                    `${booking.bookingDate}T00:00:00`
                );

                if (dateFilter === "UPCOMING") {
                    matchesDate = bookingDate >= today;
                }

                if (dateFilter === "PAST") {
                    matchesDate = bookingDate < today;
                }

                if (dateFilter === "TODAY") {
                    matchesDate =
                        bookingDate.getTime() === today.getTime();
                }
            }

            return (
                matchesSearch &&
                matchesStatus &&
                matchesDate
            );
        });
    }, [bookings, search, statusFilter, dateFilter]);

    const upcomingCount = bookings.filter((booking) => {
        if (!booking.bookingDate) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingDate = new Date(
            `${booking.bookingDate}T00:00:00`
        );

        return bookingDate >= today;
    }).length;

    const todayCount = bookings.filter((booking) => {
        if (!booking.bookingDate) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingDate = new Date(
            `${booking.bookingDate}T00:00:00`
        );

        return bookingDate.getTime() === today.getTime();
    }).length;

    const confirmedCount = bookings.filter(
        (booking) => booking.status === "CONFIRMED"
    ).length;

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (time) => {
        if (!time) return "-";

        const parts = time.split(":");

        if (parts.length < 2) return time;

        const date = new Date();

        date.setHours(
            Number(parts[0]),
            Number(parts[1]),
            0,
            0
        );

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="bookings-loading">
                <div className="bookings-loader"></div>
                Loading bookings...
            </div>
        );
    }

    return (
        <div className="bookings-page">

            {/* HEADER */}

            <header className="bookings-header">

                <div>
                    <span className="bookings-eyebrow">
                        PROPERTY VISITS
                    </span>

                    <h1>Bookings</h1>

                    <p>
                        Manage scheduled property visits
                        and customer appointments.
                    </p>
                </div>

                <button
                    className="bookings-refresh"
                    onClick={loadBookings}
                >
                    ↻ Refresh
                </button>

            </header>


            {/* SUMMARY */}

            <section className="booking-stats">

                <div className="booking-stat">
                    <span>Total Bookings</span>
                    <strong>{bookings.length}</strong>
                </div>

                <div className="booking-stat">
                    <span>Upcoming</span>
                    <strong>{upcomingCount}</strong>
                </div>

                <div className="booking-stat">
                    <span>Today</span>
                    <strong>{todayCount}</strong>
                </div>

                <div className="booking-stat">
                    <span>Confirmed</span>
                    <strong>{confirmedCount}</strong>
                </div>

            </section>


            {/* FILTERS */}

            <section className="booking-toolbar">

                <div className="booking-search">

                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Search customer, phone, email or property..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <select
                    value={dateFilter}
                    onChange={(e) =>
                        setDateFilter(e.target.value)
                    }
                >
                    <option value="ALL">
                        All Dates
                    </option>

                    <option value="TODAY">
                        Today
                    </option>

                    <option value="UPCOMING">
                        Upcoming
                    </option>

                    <option value="PAST">
                        Past
                    </option>
                </select>


                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="ALL">
                        All Status
                    </option>

                    <option value="CONFIRMED">
                        Confirmed
                    </option>

                    <option value="COMPLETED">
                        Completed
                    </option>

                    <option value="CANCELLED">
                        Cancelled
                    </option>
                </select>

            </section>


            {/* TABLE */}

            <section className="bookings-panel">

                <div className="bookings-panel-header">

                    <div>
                        <h2>
                            Scheduled visits
                        </h2>

                        <p>
                            {filteredBookings.length} booking
                            {filteredBookings.length !== 1
                                ? "s"
                                : ""}{" "}
                            shown
                        </p>
                    </div>

                </div>


                <div className="bookings-table-wrapper">

                    <table className="bookings-table">

                        <thead>

                            <tr>
                                <th>Booking</th>
                                <th>Customer</th>
                                <th>Property</th>
                                <th>Visit Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>

                        </thead>


                        <tbody>

                            {filteredBookings.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="booking-empty"
                                    >
                                        No bookings found.
                                    </td>
                                </tr>

                            ) : (

                                filteredBookings.map(
                                    (booking) => (

                                        <tr key={booking.id}>

                                            <td>
                                                <span className="booking-id">
                                                    #{booking.id}
                                                </span>
                                            </td>


                                            <td>

                                                <div className="customer-cell">

                                                    <div className="customer-avatar">
                                                        {(booking.lead?.name ||
                                                            "?")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {booking.lead?.name ||
                                                                "Unknown customer"}
                                                        </strong>

                                                        <span>
                                                            {booking.lead?.phone ||
                                                                "-"}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <div className="property-cell">

                                                    <strong>
                                                        {booking.lead
                                                            ?.propertyType ||
                                                            booking.propertyType ||
                                                            "-"}
                                                    </strong>

                                                    <span>
                                                        Property visit
                                                    </span>

                                                </div>

                                            </td>


                                            <td>
                                                <strong>
                                                    {formatDate(
                                                        booking.bookingDate
                                                    )}
                                                </strong>
                                            </td>


                                            <td>
                                                <span className="booking-time">
                                                    {formatTime(
                                                        booking.bookingTime
                                                    )}
                                                </span>
                                            </td>


                                            <td>

                                                <span
                                                    className={`booking-status-badge ${(
                                                        booking.status ||
                                                        "CONFIRMED"
                                                    ).toLowerCase()}`}
                                                >
                                                    {booking.status ||
                                                        "CONFIRMED"}
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>
    );
}

export default Bookings;