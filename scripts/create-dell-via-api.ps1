# Script PowerShell pour ajouter DELL via les APIs REST
# Plus simple que psql - utilise les services existants

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Ajout de DELL et ses produits via API  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "http://localhost:8080"
$headers = @{
    "Content-Type" = "application/json"
    "X-ROLE" = "ADMIN"
}

# 1. Ajouter le fournisseur DELL
Write-Host "1. Ajout du fournisseur DELL Technologies..." -ForegroundColor Yellow
$supplier = @{
    name = "DELL Technologies"
    email = "contact@dell.com"
    phone = "+1-800-289-3355"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/suppliers" -Method Post -Body $supplier -Headers $headers -ErrorAction Stop
    Write-Host "   ✓ Fournisseur DELL créé avec ID: $($response.id)" -ForegroundColor Green
    $supplierId = $response.id
} catch {
    Write-Host "   ⚠ Erreur: $_" -ForegroundColor Red
    Write-Host "   Tentative de récupération de l'ID existant..." -ForegroundColor Yellow
    $suppliers = Invoke-RestMethod -Uri "$apiUrl/suppliers" -Method Get
    $dellSupplier = $suppliers | Where-Object { $_.name -like "*DELL*" } | Select-Object -First 1
    if ($dellSupplier) {
        $supplierId = $dellSupplier.id
        Write-Host "   ✓ DELL trouvé avec ID: $supplierId" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Impossible de trouver ou créer DELL" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 2. Ajouter les produits DELL
Write-Host "2. Ajout des 5 produits DELL..." -ForegroundColor Yellow

$products = @(
    @{ sku = "DELL-XPS-13-9320"; name = "Dell XPS 13 (9320) Laptop"; price = 1299.99; criticalThreshold = 5 },
    @{ sku = "DELL-U2723DE"; name = "Dell UltraSharp 27`" 4K Monitor"; price = 549.99; criticalThreshold = 10 },
    @{ sku = "DELL-R740"; name = "Dell PowerEdge R740 Server"; price = 3499.99; criticalThreshold = 3 },
    @{ sku = "DELL-KB522"; name = "Dell Multimedia Keyboard KB522"; price = 29.99; criticalThreshold = 20 },
    @{ sku = "DELL-MS116"; name = "Dell Optical Mouse MS116"; price = 12.99; criticalThreshold = 30 }
)

$productIds = @()

foreach ($prod in $products) {
    $productJson = $prod | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$apiUrl/products" -Method Post -Body $productJson -Headers $headers -ErrorAction Stop
        Write-Host "   ✓ $($prod.name) créé avec ID: $($response.id)" -ForegroundColor Green
        $productIds += $response.id
    } catch {
        Write-Host "   ⚠ $($prod.name) existe déjà ou erreur" -ForegroundColor Yellow
        # Essayer de récupérer l'ID existant
        $allProducts = Invoke-RestMethod -Uri "$apiUrl/products" -Method Get
        $existingProd = $allProducts | Where-Object { $_.sku -eq $prod.sku } | Select-Object -First 1
        if ($existingProd) {
            Write-Host "   ✓ Produit trouvé avec ID: $($existingProd.id)" -ForegroundColor Green
            $productIds += $existingProd.id
        }
    }
}

Write-Host ""

# 3. Ajouter les stocks
Write-Host "3. Ajout des stocks pour les produits DELL..." -ForegroundColor Yellow

$stocks = @(
    @{ productId = $productIds[0]; quantity = 3; criticalThreshold = 5 },   # XPS: critique
    @{ productId = $productIds[1]; quantity = 15; criticalThreshold = 10 }, # Monitor: OK
    @{ productId = $productIds[2]; quantity = 2; criticalThreshold = 3 },   # Server: critique
    @{ productId = $productIds[3]; quantity = 25; criticalThreshold = 20 }, # Keyboard: OK
    @{ productId = $productIds[4]; quantity = 8; criticalThreshold = 30 }   # Mouse: critique
)

foreach ($stock in $stocks) {
    if ($stock.productId) {
        $stockJson = $stock | ConvertTo-Json
        try {
            $response = Invoke-RestMethod -Uri "$apiUrl/stocks" -Method Post -Body $stockJson -Headers $headers -ErrorAction Stop
            Write-Host "   ✓ Stock créé pour produit ID $($stock.productId)" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠ Stock existe déjà pour produit ID $($stock.productId)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# 4. Ajouter des commandes DELL
Write-Host "4. Ajout de commandes DELL avec différents statuts..." -ForegroundColor Yellow

$orders = @(
    @{ productId = $productIds[0]; supplierId = $supplierId; quantity = 10; status = "PENDING_APPROVAL" },
    @{ productId = $productIds[1]; supplierId = $supplierId; quantity = 5; status = "APPROVED" },
    @{ productId = $productIds[2]; supplierId = $supplierId; quantity = 2; status = "EN_COURS" },
    @{ productId = $productIds[3]; supplierId = $supplierId; quantity = 50; status = "EXPÉDIÉE" },
    @{ productId = $productIds[4]; supplierId = $supplierId; quantity = 100; status = "LIVRÉE" }
)

foreach ($order in $orders) {
    if ($order.productId -and $order.supplierId) {
        $orderJson = $order | ConvertTo-Json
        try {
            $response = Invoke-RestMethod -Uri "$apiUrl/orders" -Method Post -Body $orderJson -Headers $headers -ErrorAction Stop
            Write-Host "   ✓ Commande créée: Produit $($order.productId) - Status: $($order.status)" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠ Erreur commande: $_" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Initialisation terminée !              " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Résumé:" -ForegroundColor White
Write-Host "  - Fournisseur DELL (ID: $supplierId)" -ForegroundColor White
Write-Host "  - 5 Produits DELL ajoutés" -ForegroundColor White
Write-Host "  - 5 Stocks créés" -ForegroundColor White
Write-Host "  - 5 Commandes créées avec différents statuts" -ForegroundColor White
Write-Host ""
Write-Host "Connexion SUPPLIER:" -ForegroundColor Cyan
Write-Host "  Username: supplier" -ForegroundColor White
Write-Host "  Password: supplier" -ForegroundColor White
Write-Host "  Accès: Commandes DELL uniquement (supplierId = $supplierId)" -ForegroundColor White
Write-Host ""
