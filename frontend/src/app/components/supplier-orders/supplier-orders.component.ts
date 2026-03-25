import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-supplier-orders',
  templateUrl: './supplier-orders.component.html',
  styleUrls: ['./supplier-orders.component.scss']
})
export class SupplierOrdersComponent implements OnInit {
  orders: any[] = [];
  displayedColumns: string[] = ['id', 'productId', 'quantity', 'status', 'actions'];
  supplierId: number | null = null;
  isAdmin = false;
  statusOptions = ['PENDING_APPROVAL', 'APPROVED', 'EN_COURS', 'EXPÉDIÉE', 'LIVRÉE', 'CANCELLED'];

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
    this.supplierId = user?.supplierId || null;

    if (this.supplierId) {
      this.loadSupplierOrders();
    }
  }

  loadSupplierOrders(): void {
    if (!this.supplierId) return;

    this.orderService.getOrdersBySupplierId(this.supplierId).subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commandes fournisseur', err);
      }
    });
  }

  updateStatus(order: any, newStatus: string): void {
    const updated = { ...order, status: newStatus };
    this.orderService.updateOrder(order.id, updated).subscribe({
      next: () => {
        order.status = newStatus;
        alert('Statut mis à jour avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut', err);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  canUpdateStatus(order: any): boolean {
    // Supplier peut mettre à jour les statuts suivants
    const allowedStatuses = ['EN_COURS', 'EXPÉDIÉE', 'LIVRÉE'];
    return true; // Le fournisseur peut mettre à jour tous ses statuts
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING_APPROVAL': 'status-pending',
      'APPROVED': 'status-approved',
      'EN_COURS': 'status-in-progress',
      'EXPÉDIÉE': 'status-shipped',
      'LIVRÉE': 'status-delivered',
      'CANCELLED': 'status-cancelled'
    };
    return statusMap[status] || '';
  }
}
