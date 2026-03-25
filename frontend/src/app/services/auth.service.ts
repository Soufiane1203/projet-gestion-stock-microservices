import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'currentUser';
  private readonly ADMIN_USER = { username: 'admin', password: 'admin', role: 'ADMIN' as const };
  private readonly NORMAL_USER = { username: 'user', password: 'user', role: 'USER' as const };
  private readonly SUPPLIER_USER = { username: 'supplier', password: 'supplier', role: 'SUPPLIER' as const, supplierId: 4 };

  constructor() { }

  login(username: string, password: string): Observable<AuthResponse> {
    // Authentification simple pour la démo (pas de vrai backend auth)
    let user: User | null = null;

    if (username === this.ADMIN_USER.username && password === this.ADMIN_USER.password) {
      user = this.ADMIN_USER;
    } else if (username === this.NORMAL_USER.username && password === this.NORMAL_USER.password) {
      user = this.NORMAL_USER;
    } else if (username === this.SUPPLIER_USER.username && password === this.SUPPLIER_USER.password) {
      user = this.SUPPLIER_USER;
    }

    if (user) {
      const response: AuthResponse = {
        user,
        authenticated: true
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      return of(response);
    } else {
      return of({ user: { username: '', password: '', role: 'USER' }, authenticated: false });
    }
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  isSupplier(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'SUPPLIER';
  }

  hasRole(role: 'ADMIN' | 'USER' | 'SUPPLIER'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}
