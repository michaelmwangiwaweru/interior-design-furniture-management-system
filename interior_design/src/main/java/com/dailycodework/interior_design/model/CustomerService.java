package com.dailycodework.interior_design.model;

import jakarta.persistence.*;

@Entity
@Table(name = "customer_services")
public class CustomerService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;
    private String contact;
    private String date;
    private String time;
    private String inquiry;
    private String feedback;

    // Constructors
    public CustomerService() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getInquiry() { return inquiry; }
    public void setInquiry(String inquiry) { this.inquiry = inquiry; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}
