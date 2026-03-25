import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../../services/supplier.service';
import { Supplier } from '../../models/supplier.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupplierDialogComponent } from './supplier-dialog/supplier-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  displayedColumns: string[] = [];
  readonly baseColumns: string[] = ['id', 'name', 'email', 'phone'];
  isAdmin = false;

  constructor(
    private supplierService: SupplierService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.displayedColumns = this.isAdmin ? [...this.baseColumns, 'actions'] : [...this.baseColumns];
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAll().subscribe({
      next: (data: Supplier[]) => {
        this.suppliers = data || [];
        console.log('Fournisseurs chargés:', this.suppliers.length);
      },
      error: () => {
        console.error('Erreur chargement fournisseurs');
        this.suppliers = [];
        this.snackBar.open('Erreur lors du chargement des fournisseurs', 'Fermer');
      }
    });
  }

  openDialog(supplier?: Supplier): void {
    if (!this.isAdmin) {
      this.snackBar.open('Accès réservé aux administrateurs', 'Fermer', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(SupplierDialogComponent, {
      width: '500px',
      data: supplier || {}
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result !== false) {
        setTimeout(() => this.loadSuppliers(), 300);
      }
    });
  }

  deleteSupplier(id: number): void {
    if (!this.isAdmin) {
      this.snackBar.open('Accès réservé aux administrateurs', 'Fermer', { duration: 3000 });
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur?')) {
      this.supplierService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Fournisseur supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadSuppliers();
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer')
      });
    }
  }
}
