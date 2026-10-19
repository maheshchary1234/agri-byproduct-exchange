package com.agriexchange.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_code", nullable = false, unique = true, length = 100)
    private String transactionCode;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "payer_id", nullable = false)
    private User payer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "payee_id", nullable = false)
    private User payee;

    @Column(nullable = false)
    private Double amount;

    private String currency = "INR";

    @Column(name = "payment_gateway")
    private String paymentGateway = "RAZORPAY_ESCROW";

    @Column(name = "gateway_reference")
    private String gatewayReference;

    @Column(nullable = false, length = 50)
    private String status = "SUCCESS";

    @Column(name = "escrow_release_status", length = 50)
    private String escrowReleaseStatus = "HELD"; // HELD, RELEASED, REFUNDED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Transaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionCode() { return transactionCode; }
    public void setTransactionCode(String transactionCode) { this.transactionCode = transactionCode; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public User getPayer() { return payer; }
    public void setPayer(User payer) { this.payer = payer; }

    public User getPayee() { return payee; }
    public void setPayee(User payee) { this.payee = payee; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPaymentGateway() { return paymentGateway; }
    public void setPaymentGateway(String paymentGateway) { this.paymentGateway = paymentGateway; }

    public String getGatewayReference() { return gatewayReference; }
    public void setGatewayReference(String gatewayReference) { this.gatewayReference = gatewayReference; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEscrowReleaseStatus() { return escrowReleaseStatus; }
    public void setEscrowReleaseStatus(String escrowReleaseStatus) { this.escrowReleaseStatus = escrowReleaseStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
