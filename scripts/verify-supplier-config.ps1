# Script de verification rapide pour la demo SUPPLIER
# Verifie que DELL est bien configure avec supplierId = 1

Write-Host "======================================================"
Write-Host "  Verification Configuration SUPPLIER DELL"
Write-Host "======================================================"
Write-Host ""

$env:PGPASSWORD = "postgres"

Write-Host "1. Verification du fournisseur DELL (doit avoir ID = 1)"
Write-Host "------------------------------------------------------"
psql -U postgres -d supplier_db -c "SELECT id, name, email FROM suppliers WHERE id = 1;"

Write-Host ""
Write-Host "2. Verification des commandes DELL (supplier_id = 1)"
Write-Host "------------------------------------------------------"
psql -U postgres -d order_db -c "SELECT id, product_id, supplier_id, quantity, status FROM orders WHERE supplier_id = 1 ORDER BY id;"

Write-Host ""
Write-Host "3. Verification compte frontend (supplier/supplier -> supplierId: 1)"
Write-Host "------------------------------------------------------"
$authServicePath = "c:\Users\MINO\Desktop\Projet-gestion de stock\frontend\src\app\services\auth.service.ts"
if (Test-Path $authServicePath) {
    $content = Get-Content $authServicePath -Raw
    if ($content -match "SUPPLIER_USER.*supplierId:\s*1") {
        Write-Host "✓ Compte supplier correctement configure avec supplierId: 1" -ForegroundColor Green
    } else {
        Write-Host "✗ ERREUR: supplierId non configure ou incorrect" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Fichier auth.service.ts introuvable" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Verification endpoint backend (/orders/supplier/{id})"
Write-Host "------------------------------------------------------"
$orderControllerPath = "c:\Users\MINO\Desktop\Projet-gestion de stock\order-service\src\main\java\com\monprojet\order\security\RoleGuard.java"
if (Test-Path $orderControllerPath) {
    $content = Get-Content $orderControllerPath -Raw
    if ($content -match "isSupplier") {
        Write-Host "✓ Methode isSupplier() presente dans RoleGuard" -ForegroundColor Green
    } else {
        Write-Host "✗ ERREUR: Methode isSupplier() manquante" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Fichier RoleGuard.java introuvable" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================================"
Write-Host "  Résumé"
Write-Host "======================================================"
Write-Host ""
Write-Host "Configuration pour la demo:" -ForegroundColor Cyan
Write-Host "  - Fournisseur: DELL Technologies (ID: 1)" -ForegroundColor White
Write-Host "  - Compte: supplier / supplier" -ForegroundColor White
Write-Host "  - Acces: Commandes DELL uniquement" -ForegroundColor White
Write-Host ""
Write-Host "URL Frontend: http://localhost:4200" -ForegroundColor Yellow
Write-Host ""
Write-Host "Comptes de test:" -ForegroundColor Cyan
Write-Host "  1. admin/admin    - Gestion complete" -ForegroundColor White
Write-Host "  2. user/user      - Creation de demandes" -ForegroundColor White
Write-Host "  3. supplier/supplier - Commandes DELL uniquement" -ForegroundColor Green
Write-Host ""

Remove-Item Env:\PGPASSWORD
