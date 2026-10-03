import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Enquiries.css";

const API = "http://localhost:8080/api";

const ACTIVE_STATUSES = ["PENDING"];

const HISTORY_STATUSES = [
    "CONTACTED",
    "INTERESTED",
    "NOT_INTERESTED",
];

function Enquiries() {
    const [activeTab, setActiveTab] = useState("queue");

    const [queue, setQueue] = useState([]);
    const [history, setHistory] = useState([]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const [queueResponse, historyResponse] =
                await Promise.all([
                    axios.get(`${API}/inquiries/queue`),
                    axios.get(`${API}/inquiries/history`),
                ]);

            setQueue(queueResponse.data);
            setHistory(historyResponse.data);
        } catch (error) {
            console.error("Failed to load enquiries:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            setUpdatingId(id);

            await axios.put(
                `${API}/inquiries/${id}/status?status=${encodeURIComponent(
                    status
                )}`
            );

            await loadData();
        } catch (error) {
            console.error(
                "Failed to update enquiry:",
                error
            );

            alert("Failed to update enquiry.");
        } finally {
            setUpdatingId(null);
        }
    };

    const currentData =
        activeTab === "queue" ? queue : history;

    const filteredData = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        if (!searchText) {
            return currentData;
        }

        return currentData.filter((inquiry) => {
            const name =
                inquiry.lead?.name || "";

            const phone =
                inquiry.lead?.phone || "";

            const email =
                inquiry.lead?.email || "";

            const property =
                inquiry.lead?.propertyType || "";

            const requirements =
                inquiry.lead?.requirements || "";

            return (
                name.toLowerCase().includes(searchText) ||
                phone.toLowerCase().includes(searchText) ||
                email.toLowerCase().includes(searchText) ||
                property.toLowerCase().includes(searchText) ||
                requirements.toLowerCase().includes(searchText)
            );
        });
    }, [currentData, search]);

    const pendingCount = queue.length;

    const contactedCount = history.filter(
        (item) => item.status === "CONTACTED"
    ).length;

    const interestedCount = history.filter(
        (item) => item.status === "INTERESTED"
    ).length;

    const notInterestedCount = history.filter(
        (item) => item.status === "NOT_INTERESTED"
    ).length;

    const formatDateTime = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const getInitial = (name) => {
        if (!name) return "?";

        return name
            .trim()
            .charAt(0)
            .toUpperCase();
    };

    const formatStatus = (status) => {
        if (!status) return "-";

        return status
            .toLowerCase()
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    if (loading) {
        return (
            <div className="enquiries-loading">
                <div className="enquiries-loader"></div>
                Loading enquiries...
            </div>
        );
    }

    return (
        <div className="enquiries-page">

            {/* HEADER */}

            <header className="enquiries-header">

                <div>
                    <span className="enquiries-eyebrow">
                        CUSTOMER FOLLOW-UP
                    </span>

                    <h1>Enquiries</h1>

                    <p>
                        Manage customers who need a call
                        from the property team.
                    </p>
                </div>

                <button
                    className="enquiries-refresh"
                    onClick={loadData}
                >
                    ↻ Refresh
                </button>

            </header>


            {/* STATS */}

            <section className="enquiry-stats">

                <div className="enquiry-stat">
                    <span>Pending Calls</span>
                    <strong>{pendingCount}</strong>
                    <small>Need attention</small>
                </div>

                <div className="enquiry-stat">
                    <span>Contacted</span>
                    <strong>{contactedCount}</strong>
                    <small>Calls completed</small>
                </div>

                <div className="enquiry-stat">
                    <span>Interested</span>
                    <strong>{interestedCount}</strong>
                    <small>Positive responses</small>
                </div>

                <div className="enquiry-stat">
                    <span>Not Interested</span>
                    <strong>{notInterestedCount}</strong>
                    <small>Closed enquiries</small>
                </div>

            </section>


            {/* MAIN PANEL */}

            <section className="enquiries-panel">

                {/* PANEL HEADER */}

                <div className="enquiries-panel-header">

                    <div className="enquiry-tabs">

                        <button
                            className={
                                activeTab === "queue"
                                    ? "enquiry-tab active"
                                    : "enquiry-tab"
                            }
                            onClick={() =>
                                setActiveTab("queue")
                            }
                        >
                            Call Queue

                            <span className="tab-count">
                                {queue.length}
                            </span>
                        </button>

                        <button
                            className={
                                activeTab === "history"
                                    ? "enquiry-tab active"
                                    : "enquiry-tab"
                            }
                            onClick={() =>
                                setActiveTab("history")
                            }
                        >
                            History

                            <span className="tab-count">
                                {history.length}
                            </span>
                        </button>

                    </div>


                    <div className="enquiry-search">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search customer, phone or requirement..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                </div>


                {/* QUEUE */}

                {activeTab === "queue" && (

                    <div className="call-queue">

                        {filteredData.length === 0 ? (

                            <div className="enquiry-empty">

                                <div className="empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    No pending enquiries
                                </h3>

                                <p>
                                    Your call queue is clear.
                                </p>

                            </div>

                        ) : (

                            filteredData.map((inquiry) => {

                                const lead = inquiry.lead;

                                return (
                                    <div
                                        className="enquiry-card"
                                        key={inquiry.id}
                                    >

                                        {/* CUSTOMER */}

                                        <div className="enquiry-customer">

                                            <div className="enquiry-avatar">
                                                {getInitial(
                                                    lead?.name
                                                )}
                                            </div>

                                            <div>

                                                <strong>
                                                    {lead?.name ||
                                                        "Unknown customer"}
                                                </strong>

                                                <span>
                                                    {lead?.phone || "-"}
                                                </span>

                                            </div>

                                        </div>


                                        {/* REQUIREMENT */}

                                        <div className="enquiry-requirement">

                                            <span className="field-label">
                                                PROPERTY
                                            </span>

                                            <strong>
                                                {lead?.propertyType ||
                                                    "Not specified"}
                                            </strong>

                                            <p>
                                                {lead?.requirements ||
                                                    "No additional requirements provided."}
                                            </p>

                                        </div>


                                        {/* CREATED */}

                                        <div className="enquiry-created">

                                            <span className="field-label">
                                                RECEIVED
                                            </span>

                                            <span>
                                                {formatDateTime(
                                                    inquiry.createdAt
                                                )}
                                            </span>

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="enquiry-actions">

                                            <a
                                                className="call-button"
                                                href={`tel:${lead?.phone || ""}`}
                                            >
                                                ☎ Call
                                            </a>

                                            <button
                                                className="interest-button"
                                                disabled={
                                                    updatingId === inquiry.id
                                                }
                                                onClick={() =>
                                                    updateStatus(
                                                        inquiry.id,
                                                        "INTERESTED"
                                                    )
                                                }
                                            >
                                                Interested
                                            </button>

                                            <button
                                                className="contact-button"
                                                disabled={
                                                    updatingId === inquiry.id
                                                }
                                                onClick={() =>
                                                    updateStatus(
                                                        inquiry.id,
                                                        "CONTACTED"
                                                    )
                                                }
                                            >
                                                Contacted
                                            </button>

                                            <button
                                                className="reject-button"
                                                disabled={
                                                    updatingId === inquiry.id
                                                }
                                                onClick={() =>
                                                    updateStatus(
                                                        inquiry.id,
                                                        "NOT_INTERESTED"
                                                    )
                                                }
                                            >
                                                Not Interested
                                            </button>

                                        </div>

                                    </div>
                                );
                            })

                        )}

                    </div>

                )}


                {/* HISTORY */}

                {activeTab === "history" && (

                    <div className="history-table-wrapper">

                        <table className="history-table">

                            <thead>

                                <tr>
                                    <th>Customer</th>
                                    <th>Property</th>
                                    <th>Received</th>
                                    <th>Status</th>
                                    <th>Handled</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredData.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="history-empty"
                                        >
                                            No enquiry history found.
                                        </td>
                                    </tr>

                                ) : (

                                    filteredData.map(
                                        (inquiry) => {

                                            const lead =
                                                inquiry.lead;

                                            return (
                                                <tr key={inquiry.id}>

                                                    <td>

                                                        <div className="history-customer">

                                                            <div className="history-avatar">
                                                                {getInitial(
                                                                    lead?.name
                                                                )}
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {lead?.name ||
                                                                        "Unknown"}
                                                                </strong>

                                                                <span>
                                                                    {lead?.phone ||
                                                                        "-"}
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {lead?.propertyType ||
                                                                "-"}
                                                        </strong>

                                                        <span className="history-requirement">
                                                            {lead?.requirements ||
                                                                "No requirement"}
                                                        </span>

                                                    </td>


                                                    <td>
                                                        {formatDateTime(
                                                            inquiry.createdAt
                                                        )}
                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`enquiry-status ${(
                                                                inquiry.status ||
                                                                ""
                                                            ).toLowerCase()}`}
                                                        >
                                                            {formatStatus(
                                                                inquiry.status
                                                            )}
                                                        </span>

                                                    </td>


                                                    <td>
                                                        {formatDateTime(
                                                            inquiry.handledAt
                                                        )}
                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}

export default Enquiries;