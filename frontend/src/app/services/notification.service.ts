import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) { }

  getAlerts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/alerts`);
  }

  // Récupérer les alertes en temps réel (polling toutes les 10 secondes)
  getAlertsRealtime(): Observable<string[]> {
    return interval(10000).pipe(
      startWith(0),
      switchMap(() => this.getAlerts())
    );
  }

  clearAlerts(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alerts`);
  }
}
