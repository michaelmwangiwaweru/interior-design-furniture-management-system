package com.dailycodework.interior_design.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String date;
    private String phone;
    private String itemDescription;
    private int quantity;
    private double unitPrice;
    private double totalPrice;
    private double deposit;
    private double balance;
    private String paymentStatus;

    // NEW FIELDS
    private String expectedFinishDate;
    private String actualCompletionDate;
    private String status; // In Progress / Completed
    private String showroomOrWorkshopName;
    private String assignedTo;
    private String stage; // Cutting / Assembly / Finishing
    private String remarks;
}
