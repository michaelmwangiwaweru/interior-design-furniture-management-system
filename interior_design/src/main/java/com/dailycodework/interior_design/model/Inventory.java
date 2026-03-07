package com.dailycodework.interior_design.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;
    private String materialName;
    private String units;
    private int quantityOut;
    private int balance;
    private String issuedTo;
    private String purpose;
    private String approvedBy;
    private String workshopOrShowroom;
}
