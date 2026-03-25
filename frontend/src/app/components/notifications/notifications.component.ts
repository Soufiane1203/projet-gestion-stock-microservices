import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  alerts: string[] = [];
  isAdmin = false;
  isClearing = false;
  private subscription?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadAlerts();
    // Activer le polling automatique toutes les 10 secondes
    this.subscription = this.notificationService.getAlertsRealtime().subscribe({
      next: (alerts) => {
        this.alerts = alerts ? [...alerts].reverse() : [];
      },
      error: (err) => console.error('Erreur polling alertes:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadAlerts(): void {
    this.notificationService.getAlerts().subscribe({
      next: (data) => {
        this.alerts = data ? [...data].reverse() : [];
        console.log('Alertes chargées:', this.alerts.length);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des alertes:', err);
        this.alerts = [];
      }
    });
  }

  refreshAlerts(): void {
    console.log('Actualisation manuelle des alertes...');
    this.loadAlerts();
  }

  clearAlerts(): void {
    if (!this.isAdmin || this.isClearing) {
      return;
    }

    const confirmed = confirm('Voulez-vous purger toutes les alertes ?');
    if (!confirmed) {
      return;
    }

    this.isClearing = true;
    this.notificationService.clearAlerts().subscribe({
      next: () => {
        this.alerts = [];
        this.isClearing = false;
      },
      error: () => {
        console.error('Erreur lors de la purge des alertes');
        this.isClearing = false;
      }
    });
  }
}
