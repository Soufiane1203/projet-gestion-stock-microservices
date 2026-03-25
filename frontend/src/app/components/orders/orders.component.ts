import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { SupplierService } from '../../services/supplier.service';
import { Order } from '../../models/order.model';
import { Product } from '../../models/product.model';
import { Supplier } from '../../models/supplier.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderDialogComponent } from './order-dialog/order-dialog.component';
import { SupplyRequestDialogComponent } from './supply-request-dialog/supply-request-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  products: Product[] = [];
  suppliers: Supplier[] = [];
  displayedColumns: string[] = [];
  readonly baseColumns: string[] = ['id', 'productId', 'supplierId', 'quantity', 'status'];
  isAdmin = false;
  canRequestSupply = false;
  readonly pendingStatus = 'PENDING_APPROVAL';

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private supplierService: SupplierService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.canRequestSupply = !this.isAdmin;
    this.displayedColumns = this.isAdmin ? [...this.baseColumns, 'actions'] : [...this.baseColumns];
    this.loadOrders();
    this.loadProducts();
    this.loadSuppliers();
  }

  loadOrders(): void {
    this.orderService.getAll().subscribe({
      next: (data: Order[]) => {
        this.orders = data || [];
        console.log('Commandes chargées:', this.orders.length);
      },
      error: () => {
        console.error('Erreur chargement commandes');
        this.orders = [];
        this.snackBar.open('Erreur lors du chargement des commandes', 'Fermer');
      }
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data: Product[]) => this.products = data || [],
      error: () => {
        console.error('Erreur chargement produits');
        this.products = [];
      }
    });
  }

  loadSuppliers(): void {
    this.supplierService.getAll().subscribe({
      next: (data: Supplier[]) => this.suppliers = data || [],
      error: () => {
        console.error('Erreur chargement fournisseurs');
        this.suppliers = [];
      }
    });
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : `Produit ${productId}`;
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : `Fournisseur ${supplierId}`;
  }

  openDialog(order?: Order): void {
    if (!this.isAdmin) {
      this.snackBar.open('Accès réservé aux administrateurs', 'Fermer', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(OrderDialogComponent, {
      width: '500px',
      data: { order: order || {}, products: this.products, suppliers: this.suppliers }
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result !== false) {
        setTimeout(() => this.loadOrders(), 300);
      }
    });
  }

  openSupplyRequestDialog(): void {
    if (!this.canRequestSupply) {
      return;
    }
    const dialogRef = this.dialog.open(SupplyRequestDialogComponent, {
      width: '500px',
      data: { products: this.products, suppliers: this.suppliers }
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result !== false) {
        setTimeout(() => this.loadOrders(), 300);
      }
    });
  }

  deleteOrder(id: number): void {
    if (!this.isAdmin) {
      this.snackBar.open('Accès réservé aux administrateurs', 'Fermer', { duration: 3000 });
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande?')) {
      this.orderService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Commande supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadOrders();
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer')
      });
    }
  }

  approveRequest(order: Order): void {
    if (!this.isAdmin || !order.id) {
      return;
    }
    const payload: Order = { ...order, status: 'CONFIRMED' };
    this.orderService.update(order.id, payload).subscribe({
      next: () => {
        this.snackBar.open('Demande validée avec succès', 'Fermer', { duration: 3000 });
        this.loadOrders();
      },
      error: () => this.snackBar.open('Erreur lors de la validation', 'Fermer')
    });
  }

  rejectRequest(order: Order): void {
    if (!this.isAdmin || !order.id) {
      return;
    }
    const payload: Order = { ...order, status: 'CANCELLED' };
    this.orderService.update(order.id, payload).subscribe({
      next: () => {
        this.snackBar.open('Demande refusée', 'Fermer', { duration: 3000 });
        this.loadOrders();
      },
      error: () => this.snackBar.open('Erreur lors du refus', 'Fermer')
    });
  }
}
