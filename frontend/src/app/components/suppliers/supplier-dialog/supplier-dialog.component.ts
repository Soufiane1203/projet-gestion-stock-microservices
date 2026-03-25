import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-supplier-dialog',
  templateUrl: './supplier-dialog.component.html',
  styleUrls: ['./supplier-dialog.component.scss']
})
export class SupplierDialogComponent implements OnInit {
  supplierForm: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private dialogRef: MatDialogRef<SupplierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Supplier,
    private snackBar: MatSnackBar
  ) {
    this.supplierForm = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      phone: ['']
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.isEdit = true;
      this.supplierForm.patchValue(this.data);
    }
  }

  onSubmit(): void {
    if (this.supplierForm.valid) {
      const supplier: Supplier = this.supplierForm.value;
      if (this.isEdit) {
        this.supplierService.update(this.data.id!, supplier).subscribe({
          next: () => {
            this.snackBar.open('Fournisseur modifié avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Erreur modification fournisseur:', err);
            let errorMessage = 'Erreur lors de la modification';
            if (err.status === 401) errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
            else if (err.status === 403) errorMessage = 'Accès refusé. Privilèges administrateur requis.';
            this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
            this.dialogRef.close(false);
          }
        });
      } else {
        this.supplierService.create(supplier).subscribe({
          next: () => {
            this.snackBar.open('Fournisseur créé avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Erreur création fournisseur:', err);
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
