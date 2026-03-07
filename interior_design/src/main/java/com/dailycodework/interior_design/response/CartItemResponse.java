package com.dailycodework.interior_design.response;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CartItemResponse {

    private Long id;
    private String name;
    private Double priceAtAddition;

    // React uses: item.photoBase64
    private String photoBase64;
}
