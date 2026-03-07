package com.dailycodework.interior_design.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sessionId;

    @Column(nullable = false)
    private Long catalogItemId;

    /** SNAPSHOT FIELDS */
    private String name;
    private Double priceAtAddition;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String photo; // Base64 STRING (same as CatalogItem)
}
