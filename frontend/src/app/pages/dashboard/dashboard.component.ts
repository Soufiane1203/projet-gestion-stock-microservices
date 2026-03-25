import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { StockService } from '../../services/stock.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalProducts = 0;
  totalOrders = 0;
  criticalStocks = 0;
  recentAlerts: string[] = [];
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private stockService: StockService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadStatistics();
    this.loadAlerts();
  }

  loadStatistics(): void {
    if (this.isAdmin) {
      this.productService.getAll().subscribe({
        next: (products) => {
          this.totalProducts = (products || []).length;
        },
        error: (err) => {
          console.error('Erreur chargement produits:', err);
          this.totalProducts = 0;
        }
      });
    }

    this.orderService.getAll().subscribe({
      next: (orders) => {
        this.totalOrders = (orders || []).length;
      },
      error: (err) => {
        console.error('Erreur chargement commandes:', err);
        this.totalOrders = 0;
      }
    });

    this.stockService.getCriticalStocks().subscribe({
      next: (stocks) => {
        this.criticalStocks = (stocks || []).length;
      },
      error: (err) => {
        console.error('Erreur chargement stocks critiques:', err);
        this.criticalStocks = 0;
      }
    });
  }

  loadAlerts(): void {
    this.notificationService.getAlerts().subscribe({
      next: (alerts) => {
        this.recentAlerts = (alerts || []).slice(-5).reverse();
      },
      error: (err) => {
        console.error('Erreur chargement alertes:', err);
        this.recentAlerts = [];
      }
    });
  }
}
