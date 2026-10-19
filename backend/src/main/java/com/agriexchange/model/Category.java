package com.agriexchange.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "carbon_offset_factor")
    private Double carbonOffsetFactor = 1.20;

    public Category() {}

    public Category(String name, String code, String description, Double carbonOffsetFactor) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.carbonOffsetFactor = carbonOffsetFactor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getCarbonOffsetFactor() { return carbonOffsetFactor; }
    public void setCarbonOffsetFactor(Double carbonOffsetFactor) { this.carbonOffsetFactor = carbonOffsetFactor; }
}
