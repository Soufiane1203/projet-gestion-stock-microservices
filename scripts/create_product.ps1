$body = @{ 
    sku = "SKU-NEW" 
    name = "Produit Test" 
    price = 150 
    criticalThreshold = 50 
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri 'http://localhost:8081/products' -Body $body -ContentType 'application/json'
