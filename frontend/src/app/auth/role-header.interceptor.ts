import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RoleHeaderInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Toujours récupérer le user depuis le localStorage pour garantir la fraîcheur
    const user = this.authService.getCurrentUser();
    const role = user?.role;

    // Log pour debugging
    if (req.url.includes('/stocks') || req.url.includes('/products') || 
        req.url.includes('/suppliers') || req.url.includes('/orders')) {
      console.log('Interceptor - URL:', req.url, 'Method:', req.method, 'Role:', role);
    }

    // Ne pas ajouter le header si pas de rôle (requêtes publiques)
    if (!role) {
      console.warn('No role found for request:', req.url);
      return next.handle(req);
    }

    // Cloner la requête avec le header X-ROLE
    const authorizedRequest = req.clone({
      setHeaders: {
        'X-ROLE': role
      }
    });

    return next.handle(authorizedRequest);
  }
}
