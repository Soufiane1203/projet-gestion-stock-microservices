-- Script SQL pour ajouter DELL et ses produits
-- A exécuter dans pgAdmin ou via psql

-- 1. Ajouter le fournisseur DELL
INSERT INTO suppliers (id, name, email, phone) 
VALUES (1, 'DELL Technologies', 'contact@dell.com', '+1-800-289-3355')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    email = EXCLUDED.email, 
    phone = EXCLUDED.phone;

-- Réinitialiser la séquence
SELECT setval('suppliers_id_seq', (SELECT MAX(id) FROM suppliers));

-- 2. Ajouter les produits DELL
INSERT INTO products (id, sku, name, price, critical_threshold) VALUES
(1, 'DELL-XPS-13-9320', 'Dell XPS 13 (9320) Laptop', 1299.99, 5),
(2, 'DELL-U2723DE', 'Dell UltraSharp 27" 4K Monitor', 549.99, 10),
(3, 'DELL-R740', 'Dell PowerEdge R740 Server', 3499.99, 3),
(4, 'DELL-KB522', 'Dell Multimedia Keyboard KB522', 29.99, 20),
(5, 'DELL-MS116', 'Dell Optical Mouse MS116', 12.99, 30)
ON CONFLICT (sku) DO UPDATE 
SET name = EXCLUDED.name, 
    price = EXCLUDED.price, 
    critical_threshold = EXCLUDED.critical_threshold;

-- Réinitialiser la séquence
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 3. Ajouter les stocks pour les produits DELL
INSERT INTO stocks (id, product_id, quantity, critical_threshold) VALUES
(1, 1, 3, 5),   -- XPS 13: Stock critique (3 < 5)
(2, 2, 15, 10), -- Monitor: Stock OK
(3, 3, 2, 3),   -- Server: Stock critique (2 < 3)
(4, 4, 25, 20), -- Keyboard: Stock OK
(5, 5, 8, 30)   -- Mouse: Stock critique (8 < 30)
ON CONFLICT (id) DO UPDATE 
SET quantity = EXCLUDED.quantity, 
    critical_threshold = EXCLUDED.critical_threshold;

-- Réinitialiser la séquence
SELECT setval('stocks_id_seq', (SELECT MAX(id) FROM stocks));

-- 4. Ajouter des commandes DELL avec différents statuts
INSERT INTO orders (id, product_id, supplier_id, quantity, status) VALUES
(1, 1, 1, 10, 'PENDING_APPROVAL'),  -- Commande XPS en attente
(2, 2, 1, 5, 'APPROVED'),           -- Commande Monitor approuvée
(3, 3, 1, 2, 'EN_COURS'),           -- Commande Server en cours
(4, 4, 1, 50, 'EXPÉDIÉE'),          -- Commande Keyboard expédiée
(5, 5, 1, 100, 'LIVRÉE')            -- Commande Mouse livrée
ON CONFLICT (id) DO UPDATE 
SET quantity = EXCLUDED.quantity, 
    status = EXCLUDED.status;

-- Réinitialiser la séquence
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

-- Vérifications
SELECT 'Fournisseurs:' as info;
SELECT * FROM suppliers;

SELECT 'Produits:' as info;
SELECT id, sku, name, price FROM products ORDER BY id;

SELECT 'Stocks:' as info;
SELECT * FROM stocks ORDER BY id;

SELECT 'Commandes DELL:' as info;
SELECT * FROM orders WHERE supplier_id = 1 ORDER BY id;
