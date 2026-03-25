import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss']
})
export class ProductDialogComponent implements OnInit {
  productForm: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      sku: ['', Validators.required],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      criticalThreshold: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.isEdit = true;
      this.productForm.patchValue(this.data);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const product: Product = this.productForm.value;
      if (this.isEdit) {
        this.productService.update(this.data.id!, product).subscribe({
          next: () => {
            this.snackBar.open('Produit modifié avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Erreur modification produit:', err);
            let errorMessage = 'Erreur lors de la modification';
            if (err.status === 401) errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
            else if (err.status === 403) errorMessage = 'Accès refusé. Privilèges administrateur requis.';
            this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
            this.dialogRef.close(false);
          }
        });
      } else {
        this.productService.create(product).subscribe({
          next: () => {
            this.snackBar.open('Produit créé avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Erreur création produit:', err);
            let errorMessage = 'Erreur lors de la création';
            if (err.status === 401) errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
            else if (err.status === 403) errorMessage = 'Accès refusé. Privilèges administrateur requis.';
            this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
            this.dialogRef.close(false);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
