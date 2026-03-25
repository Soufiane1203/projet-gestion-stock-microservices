import { Component, OnInit } from '@angular/core';
import { StockService } from '../../services/stock.service';
import { ProductService } from '../../services/product.service';
import { Stock } from '../../models/stock.model';
import { Product } from '../../models/product.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StockDialogComponent } from './stock-dialog/stock-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.scss']
})
export class StocksComponent implements OnInit {
  stocks: Stock[] = [];
  criticalStocks: Stock[] = [];
  products: Product[] = [];
  displayedColumns: string[] = [];
  readonly baseColumns: string[] = ['id', 'productId', 'quantity', 'criticalThreshold', 'status'];
  isAdmin = false;

  constructor(
    private stockService: StockService,
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.displayedColumns = this.isAdmin ? [...this.baseColumns, 'actions'] : [...this.baseColumns];
    this.loadStocks();
    this.loadProducts();
  }

  loadStocks(): void {
    this.stockService.getAll().subscribe({
      next: (data: Stock[]) => {
        this.stocks = data || [];
        this.criticalStocks = (data || []).filter(s => s.quantity <= s.criticalThreshold);
      },
      error: (err) => {
        console.error('Erreur chargement stocks:', err);
        this.stocks = [];
        this.criticalStocks = [];
        this.snackBar.open('Erreur lors du chargement des stocks', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data: Product[]) => this.products = data || [],
      error: (err) => {
        console.error('Erreur chargement produits:', err);
        this.products = [];
      }
    });
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : `Produit ${productId}`;
  }

  isCritical(stock: Stock): boolean {
    return stock.quantity <= stock.criticalThreshold;
  }

  openDialog(stock?: Stock): void {
    if (!this.isAdmin) {
      this.snackBar.open('Accès réservé aux administrateurs', 'Fermer', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(StockDialogComponent, {
      width: '500px',
      data: { stock: stock || {}, products: this.products }
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result !== false) {
        // Recharger même si résultat undefined pour s'assurer de la cohérence
        setTimeout(() => this.loadStocks(), 300);
      }
    });
  }

  deleteStock(id: number): void {
    if (!this.isAdmin) {
      this.snackBar.open('Accès réservé aux administrateurs', 'Fermer', { duration: 3000 });
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce stock?')) {
      this.stockService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Stock supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadStocks();
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer')
      });
    }
  }
}
