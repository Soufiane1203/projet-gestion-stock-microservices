import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (response) => {
          if (response.authenticated) {
            this.snackBar.open('Connexion réussie!', 'Fermer', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open('Identifiants incorrects!', 'Fermer', { duration: 3000 });
          }
        },
        error: (err) => {
          console.error('Erreur connexion:', err);
          this.snackBar.open('Erreur de connexion. Veuillez réessayer.', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}
