package com.leadmanager.leadmanager.dto;

import java.util.List;
import java.util.Map;

public class DashboardAnalyticsResponse {

    private long totalLeads;
    private long totalVisits;
    private long totalEnquiries;

    private Map<String, Long> leadsBySource;
    private Map<String, Long> leadsByProperty;
    private Map<String, Long> leadsByStatus;

    private List<DailyLeadData> leadsOverTime;

    public DashboardAnalyticsResponse() {
    }

    public long getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(long totalLeads) {
        this.totalLeads = totalLeads;
    }

    public long getTotalVisits() {
        return totalVisits;
    }

    public void setTotalVisits(long totalVisits) {
        this.totalVisits = totalVisits;
    }

    public long getTotalEnquiries() {
        return totalEnquiries;
    }

    public void setTotalEnquiries(long totalEnquiries) {
        this.totalEnquiries = totalEnquiries;
    }

    public Map<String, Long> getLeadsBySource() {
        return leadsBySource;
    }

    public void setLeadsBySource(Map<String, Long> leadsBySource) {
        this.leadsBySource = leadsBySource;
    }

    public Map<String, Long> getLeadsByProperty() {
        return leadsByProperty;
    }

    public void setLeadsByProperty(Map<String, Long> leadsByProperty) {
        this.leadsByProperty = leadsByProperty;
    }

    public Map<String, Long> getLeadsByStatus() {
        return leadsByStatus;
    }

    public void setLeadsByStatus(Map<String, Long> leadsByStatus) {
        this.leadsByStatus = leadsByStatus;
    }

    public List<DailyLeadData> getLeadsOverTime() {
        return leadsOverTime;
    }

    public void setLeadsOverTime(List<DailyLeadData> leadsOverTime) {
        this.leadsOverTime = leadsOverTime;
    }

    public static class DailyLeadData {

        private String date;
        private long count;

        public DailyLeadData() {
        }

        public DailyLeadData(String date, long count) {
            this.date = date;
            this.count = count;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }
}