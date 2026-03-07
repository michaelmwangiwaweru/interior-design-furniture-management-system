package com.dailycodework.interior_design.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class CheckoutRequest {
    private CustomerDto customer;
    private List<CartItemDto> cart;
    private Double subtotal;

    @Getter @Setter
    public static class CustomerDto {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String address1;
        private String address2;
        private String county;
        private String subcounty;
        private String town;
        private String city;
        private String country;
    }

    @Getter @Setter
    public static class CartItemDto {
        private Long catalogItemId;
        private String name;
        private Double priceAtAddition;
        private String photoBase64;
    }
}
