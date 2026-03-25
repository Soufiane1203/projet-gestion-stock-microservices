import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = [];
  readonly baseColumns: string[] = ['id', 'sku', 'name', 'price', 'criticalThreshold'];
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.displayedColumns = this.isAdmin ? [...this.baseColumns, 'actions'] : [...this.baseColumns];
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data: Product[]) => {
        this.products = data || [];
        console.log('Produits chargés:', this.products.length);
      },
      error: () => {
        console.error('Erreur chargement produits');
        this.products = [];
        this.snackBar.open('Erreur lors du chargement des produits', 'Fermer');
      }
    });
  }

  openDialog(product?: Product): void {
    if (!this.isAdmin) {
      this.snackBar.open('Accès réservé aux administrateurs', 'Fermer', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: product || {}
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result !== false) {
        setTimeout(() => this.loadProducts(), 300);
      }
    });
  }

  deleteProduct(id: number): void {
    if (!this.isAdmin) {
      this.snackBar.open('Accès réservé aux administrateurs', 'Fermer', { duration: 3000 });
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Produit supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadProducts();
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer')
      });
    }
  }
}
