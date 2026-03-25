import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../../services/order.service';
import { Product } from '../../../models/product.model';
import { Supplier } from '../../../models/supplier.model';
import { Order } from '../../../models/order.model';

interface SupplyRequestDialogData {
  products: Product[];
  suppliers: Supplier[];
}

@Component({
  selector: 'app-supply-request-dialog',
  templateUrl: './supply-request-dialog.component.html',
  styleUrls: ['./supply-request-dialog.component.scss']
})
export class SupplyRequestDialogComponent {
  requestForm: FormGroup;
  products: Product[] = [];
  suppliers: Supplier[] = [];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private dialogRef: MatDialogRef<SupplyRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SupplyRequestDialogData,
    private snackBar: MatSnackBar
  ) {
    this.products = data.products;
    this.suppliers = data.suppliers;
    this.requestForm = this.fb.group({
      productId: [null, Validators.required],
      supplierId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit(): void {
    if (this.requestForm.invalid) {
      return;
    }
    const payload: Order = {
      ...this.requestForm.value,
      status: 'PENDING_APPROVAL'
    };
    this.orderService.create(payload).subscribe({
      next: () => {
        this.snackBar.open('Demande d\'approvisionnement envoyée', 'Fermer', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Erreur demande approvisionnement:', err);
        let errorMessage = 'Erreur lors de l\'envoi de la demande';
        if (err.status === 401) errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
        else if (err.status === 403) errorMessage = 'Accès refusé. Privilèges administrateur requis.';
        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
        this.dialogRef.close(false);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
