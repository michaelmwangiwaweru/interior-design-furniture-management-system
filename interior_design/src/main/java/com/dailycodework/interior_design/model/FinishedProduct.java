package com.dailycodework.interior_design.model;

import jakarta.persistence.*;

@Entity
public class FinishedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;
    private String dateOut;
    private String productName;
    private String sizeOrDesign;
    private Integer quantityIn;
    private Integer quantityOut;
    private Integer balance;
    private String fromWorkshopName;
    private String showroomName;
    private String approvedBy;
    private String photo; // file name

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDateOut() { return dateOut; }
    public void setDateOut(String dateOut) { this.dateOut = dateOut; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSizeOrDesign() { return sizeOrDesign; }
    public void setSizeOrDesign(String sizeOrDesign) { this.sizeOrDesign = sizeOrDesign; }

    public Integer getQuantityIn() { return quantityIn; }
    public void setQuantityIn(Integer quantityIn) { this.quantityIn = quantityIn; }

    public Integer getQuantityOut() { return quantityOut; }
    public void setQuantityOut(Integer quantityOut) { this.quantityOut = quantityOut; }

    public Integer getBalance() { return balance; }
    public void setBalance(Integer balance) { this.balance = balance; }

    public String getFromWorkshopName() { return fromWorkshopName; }
    public void setFromWorkshopName(String fromWorkshopName) { this.fromWorkshopName = fromWorkshopName; }

    public String getShowroomName() { return showroomName; }
    public void setShowroomName(String showroomName) { this.showroomName = showroomName; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }
}
