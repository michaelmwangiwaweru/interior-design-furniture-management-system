// CartItemResponse.java  (what frontend will receive)
package com.dailycodework.interior_design.dto;

import lombok.Data;

@Data
public class CartItemResponse {
    private Long id;
    private CatalogItemResponse catalogItem;
    private Double price;
    private Integer quantity;
}

@Data
class CatalogItemResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private String photo;   // base64 string
}