package com.leadmanager.leadmanager.ai;

public class AIConversationResult {

    private String intent;
    private String reply;

    private String propertyType;
    private String name;
    private String phone;
    private String email;

    private String date;
    private String time;

    private String requirements;

    private Boolean wantsVisit;

    public AIConversationResult() {
    }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public Boolean getWantsVisit() {
        return wantsVisit;
    }

    public void setWantsVisit(Boolean wantsVisit) {
        this.wantsVisit = wantsVisit;
    }
}