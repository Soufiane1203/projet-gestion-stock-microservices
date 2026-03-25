export interface User {
  username: string;
  password: string;
  role?: 'ADMIN' | 'USER' | 'SUPPLIER';
  supplierId?: number; // ID du fournisseur pour le rôle SUPPLIER
}

export interface AuthResponse {
  token?: string;
  user: User;
  authenticated: boolean;
}
