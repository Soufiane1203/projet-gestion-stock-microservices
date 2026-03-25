package com.monprojet.stock.dto;

public class StockDto {
    private Long id;
    private Long productId;
    private Integer quantity;
    private Integer criticalThreshold;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Integer getCriticalThreshold() { return criticalThreshold; }
    public void setCriticalThreshold(Integer criticalThreshold) { this.criticalThreshold = criticalThreshold; }
}


