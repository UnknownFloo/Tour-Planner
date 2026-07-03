import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TourService } from '../../services/tour.service';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink, ConfirmModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly title = signal('Tour-Planner');

  private readonly tourService = inject(TourService);
  readonly vm = new DashboardViewModel(this.tourService);
}

