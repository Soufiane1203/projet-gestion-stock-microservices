import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StockService } from '../../../services/stock.service';
import { Stock } from '../../../models/stock.model';
import { Product } from '../../../models/product.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-stock-dialog',
  templateUrl: './stock-dialog.component.html',
  styleUrls: ['./stock-dialog.component.scss']
})
export class StockDialogComponent implements OnInit {
  stockForm: FormGroup;
  isEdit = false;
  products: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private dialogRef: MatDialogRef<StockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { stock: Stock; products: Product[] },
    private snackBar: MatSnackBar
  ) {
    this.products = data.products;
    this.stockForm = this.fb.group({
      productId: [null, Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      criticalThreshold: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.data.stock && this.data.stock.id) {
      this.isEdit = true;
      this.stockForm.patchValue(this.data.stock);
    }
  }

  onSubmit(): void {
    if (this.stockForm.valid) {
      const stock: Stock = {
        ...this.stockForm.value,
        id: this.isEdit ? this.data.stock.id : undefined
      };
      
      const operation = this.isEdit 
        ? this.stockService.update(this.data.stock.id!, stock)
        : this.stockService.create(stock);

      operation.subscribe({
        next: () => {
          const message = this.isEdit ? 'Stock modifié avec succès' : 'Stock créé avec succès';
          this.snackBar.open(message, 'Fermer', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur stock complète:', err);
          let errorMessage = 'Erreur lors de l\'opération';
          
          if (err.status === 401) {
            errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
          } else if (err.status === 403) {
            errorMessage = 'Accès refusé. Privilèges administrateur requis.';
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
          this.dialogRef.close(false);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
