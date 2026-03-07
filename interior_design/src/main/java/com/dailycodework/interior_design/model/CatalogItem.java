package com.dailycodework.interior_design.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalog_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatalogItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String category;

    // Correct way to store large Base64 images
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String photo;
}