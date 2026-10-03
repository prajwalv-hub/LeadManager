package com.leadmanager.leadmanager.dto;

public class GoogleFormLeadRequest {

    private String name;
    private String phone;
    private String email;
    private String propertyType;
    private String requirements;
    private String visitDecision;
    private String preferredVisitDate;
    private String preferredVisitTime;

    public GoogleFormLeadRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getVisitDecision() {
        return visitDecision;
    }

    public void setVisitDecision(String visitDecision) {
        this.visitDecision = visitDecision;
    }

    public String getPreferredVisitDate() {
        return preferredVisitDate;
    }

    public void setPreferredVisitDate(String preferredVisitDate) {
        this.preferredVisitDate = preferredVisitDate;
    }

    public String getPreferredVisitTime() {
        return preferredVisitTime;
    }

    public void setPreferredVisitTime(String preferredVisitTime) {
        this.preferredVisitTime = preferredVisitTime;
    }
}