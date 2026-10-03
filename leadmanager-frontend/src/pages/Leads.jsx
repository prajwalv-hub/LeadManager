import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Leads.css";

const API = "http://localhost:8080/api";

const STATUSES = [
    "NEW",
    "CONTACTED",
    "INTERESTED",
    "VISIT_BOOKED",
    "VISIT_COMPLETED",
    "CONVERTED",
    "NOT_INTERESTED",
];

function Leads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [sourceFilter, setSourceFilter] = useState("ALL");
    const [propertyFilter, setPropertyFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            setLoading(true);

            const response = await axios.get(`${API}/leads`);

            setLeads(response.data);
        } catch (error) {
            console.error("Failed to load leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateLeadStatus = async (id, status) => {
        try {
            const response = await axios.put(
                `${API}/leads/${id}/status?status=${encodeURIComponent(status)}`
            );

            setLeads((currentLeads) =>
                currentLeads.map((lead) =>
                    lead.id === id ? response.data : lead
                )
            );
        } catch (error) {
            console.error("Failed to update lead status:", error);

            alert("Failed to update lead status.");
        }
    };

    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                !search ||
                String(lead.name || "")
                    .toLowerCase()
                    .includes(searchText) ||
                String(lead.phone || "")
                    .toLowerCase()
                    .includes(searchText) ||
                String(lead.email || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesSource =
                sourceFilter === "ALL" ||
                lead.source === sourceFilter;

            const matchesProperty =
                propertyFilter === "ALL" ||
                lead.propertyType === propertyFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                lead.status === statusFilter;

            return (
                matchesSearch &&
                matchesSource &&
                matchesProperty &&
                matchesStatus
            );
        });
    }, [
        leads,
        search,
        sourceFilter,
        propertyFilter,
        statusFilter,
    ]);

    const totalLeads = leads.length;

    const newLeads = leads.filter(
        (lead) => lead.status === "NEW"
    ).length;

    const contactedLeads = leads.filter(
        (lead) => lead.status === "CONTACTED"
    ).length;

    const convertedLeads = leads.filter(
        (lead) => lead.status === "CONVERTED"
    ).length;

    return (
        <div className="leads-page">

            {/* Header */}

            <div className="leads-header">

                <div>
                    <h1>Lead Management</h1>

                    <p>
                        Manage, track and follow up with your property leads.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadLeads}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* Statistics */}

            <div className="lead-stats">

                <div className="lead-stat-card">
                    <span>Total Leads</span>
                    <strong>{totalLeads}</strong>
                </div>

                <div className="lead-stat-card">
                    <span>New</span>
                    <strong>{newLeads}</strong>
                </div>

                <div className="lead-stat-card">
                    <span>Contacted</span>
                    <strong>{contactedLeads}</strong>
                </div>

                <div className="lead-stat-card">
                    <span>Converted</span>
                    <strong>{convertedLeads}</strong>
                </div>

            </div>


            {/* Filters */}

            <div className="lead-filters">

                <input
                    type="text"
                    placeholder="Search name, phone or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                >
                    <option value="ALL">All Sources</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="GOOGLE_FORM">Google Form</option>
                </select>

                <select
                    value={propertyFilter}
                    onChange={(e) => setPropertyFilter(e.target.value)}
                >
                    <option value="ALL">All Properties</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Statuses</option>

                    {STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                        </option>
                    ))}

                </select>

            </div>


            {/* Result count */}

            <div className="lead-result-info">
                Showing <strong>{filteredLeads.length}</strong> of{" "}
                <strong>{totalLeads}</strong> leads
            </div>


            {/* Table */}

            <div className="lead-table-card">

                {loading ? (

                    <div className="lead-loading">
                        Loading leads...
                    </div>

                ) : (

                    <div className="lead-table-container">

                        <table className="lead-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Lead</th>
                                    <th>Phone</th>
                                    <th>Property</th>
                                    <th>Source</th>
                                    <th>Created</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredLeads.length === 0 ? (

                                    <tr>
                                        <td colSpan="7" className="lead-empty">
                                            No leads found.
                                        </td>
                                    </tr>

                                ) : (

                                    filteredLeads.map((lead) => (

                                        <tr key={lead.id}>

                                            <td>
                                                <strong>#{lead.id}</strong>
                                            </td>

                                            <td>

                                                <div className="lead-name">
                                                    {lead.name || "Unknown"}
                                                </div>

                                                <div className="lead-email">
                                                    {lead.email || "No email"}
                                                </div>

                                            </td>

                                            <td>
                                                {lead.phone || "-"}
                                            </td>

                                            <td>
                                                {lead.propertyType || "-"}
                                            </td>

                                            <td>

                                                <span
                                                    className={`source-badge ${lead.source === "WHATSAPP"
                                                        ? "source-whatsapp"
                                                        : "source-form"
                                                        }`}
                                                >
                                                    {lead.source === "GOOGLE_FORM"
                                                        ? "Google Form"
                                                        : "WhatsApp"}
                                                </span>

                                            </td>

                                            <td>

                                                {lead.createdAt
                                                    ? lead.createdAt
                                                        .replace("T", " ")
                                                        .substring(0, 16)
                                                    : "-"}

                                            </td>

                                            <td>

                                                <select
                                                    className={`lead-status status-${String(
                                                        lead.status || "NEW"
                                                    ).toLowerCase()}`}
                                                    value={lead.status || "NEW"}
                                                    onChange={(e) =>
                                                        updateLeadStatus(
                                                            lead.id,
                                                            e.target.value
                                                        )
                                                    }
                                                >

                                                    {STATUSES.map((status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status.replaceAll("_", " ")}
                                                        </option>
                                                    ))}

                                                </select>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Leads;