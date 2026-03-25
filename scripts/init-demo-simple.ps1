# Script PowerShell simplifie pour initialiser les donnees DEMO SUPPLIER DELL
# Usage: .\init-demo-simple.ps1

Write-Host "=================================================="
Write-Host "  Initialisation des donnees DEMO SUPPLIER DELL  "
Write-Host "=================================================="
Write-Host ""

$env:PGPASSWORD = "postgres"

Write-Host "Etape 1/4 : Creation du fournisseur DELL"
psql -U postgres -d supplier_db -c "INSERT INTO suppliers (id, name, email, phone) VALUES (1, 'DELL Technologies', 'contact@dell.com', '+1-800-289-3355') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone; SELECT setval('suppliers_id_seq', (SELECT MAX(id) FROM suppliers));"

Write-Host ""
Write-Host "Etape 2/4 : Creation des produits DELL"
psql -U postgres -d product_db -c "INSERT INTO products (id, sku, name, price, critical_threshold) VALUES (1, 'DELL-XPS-13', 'Dell XPS 13 Laptop', 1299.99, 5), (2, 'DELL-MONITOR-27', 'Dell UltraSharp 27 Monitor', 499.99, 10), (3, 'DELL-SERVER-R740', 'Dell PowerEdge R740 Server', 3499.99, 3), (4, 'DELL-KEYBOARD', 'Dell KB216 Keyboard', 29.99, 20), (5, 'DELL-MOUSE', 'Dell MS116 Mouse', 12.99, 30) ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, critical_threshold = EXCLUDED.critical_threshold; SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));"

Write-Host ""
Write-Host "Etape 3/4 : Creation des stocks"
psql -U postgres -d stock_db -c "INSERT INTO stocks (id, product_id, quantity, critical_threshold) VALUES (1, 1, 3, 5), (2, 2, 15, 10), (3, 3, 2, 3), (4, 4, 25, 20), (5, 5, 8, 30) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, critical_threshold = EXCLUDED.critical_threshold; SELECT setval('stocks_id_seq', (SELECT MAX(id) FROM stocks));"

Write-Host ""
Write-Host "Etape 4/4 : Creation des commandes DELL"
psql -U postgres -d order_db -c "INSERT INTO orders (id, product_id, supplier_id, quantity, status) VALUES (1, 1, 1, 10, 'PENDING_APPROVAL'), (2, 2, 1, 5, 'APPROVED'), (3, 3, 1, 2, 'EN_COURS'), (4, 4, 1, 50, 'EXPEDIEE'), (5, 5, 1, 100, 'LIVREE') ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, status = EXCLUDED.status; SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));"

Write-Host ""
Write-Host "=================================================="
Write-Host "  Verifications"
Write-Host "=================================================="

Write-Host ""
Write-Host "Fournisseur DELL :"
psql -U postgres -d supplier_db -c "SELECT * FROM suppliers WHERE id = 1;"

Write-Host ""
Write-Host "Produits DELL :"
psql -U postgres -d product_db -c "SELECT id, sku, name, price FROM products ORDER BY id;"

Write-Host ""
Write-Host "Stocks :"
psql -U postgres -d stock_db -c "SELECT * FROM stocks ORDER BY id;"

Write-Host ""
Write-Host "Commandes DELL :"
psql -U postgres -d order_db -c "SELECT * FROM orders WHERE supplier_id = 1 ORDER BY id;"

Write-Host ""
Write-Host "=================================================="
Write-Host "  Initialisation terminee !"
Write-Host "=================================================="
Write-Host ""
Write-Host "Frontend: http://localhost:4200"
Write-Host ""
Write-Host "Comptes de test :"
Write-Host "  - admin/admin (gestion complete)"
Write-Host "  - user/user (creation de demandes)"
Write-Host "  - supplier/supplier (commandes DELL uniquement)"
Write-Host ""

Remove-Item Env:\PGPASSWORD
