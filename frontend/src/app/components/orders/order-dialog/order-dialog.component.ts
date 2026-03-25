import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';
import { Product } from '../../../models/product.model';
import { Supplier } from '../../../models/supplier.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss']
})
export class OrderDialogComponent implements OnInit {
  orderForm: FormGroup;
  isEdit = false;
  products: Product[] = [];
  suppliers: Supplier[] = [];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: Order; products: Product[]; suppliers: Supplier[] },
    private snackBar: MatSnackBar
  ) {
    this.products = data.products;
    this.suppliers = data.suppliers;
    this.orderForm = this.fb.group({
      productId: [null, Validators.required],
      supplierId: [null, Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      status: ['CREATED']
    });
  }

  ngOnInit(): void {
    if (this.data.order && this.data.order.id) {
      this.isEdit = true;
      this.orderForm.patchValue(this.data.order);
    }
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      const order: Order = this.orderForm.value;
      if (this.isEdit) {
        this.orderService.update(this.data.order.id!, order).subscribe({
          next: () => {
            this.snackBar.open('Commande modifiée avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Erreur modification commande:', err);
            let errorMessage = 'Erreur lors de la modification';
            if (err.status === 401) errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
            else if (err.status === 403) errorMessage = 'Accès refusé. Privilèges administrateur requis.';
            this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
            this.dialogRef.close(false);
          }
        });
      } else {
        this.orderService.create(order).subscribe({
          next: () => {
            this.snackBar.open('Commande créée avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Erreur création commande:', err);
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
