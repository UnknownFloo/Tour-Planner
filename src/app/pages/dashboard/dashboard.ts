import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DecimalPipe, NgFor } from '@angular/common';
import { MockDataService } from '../../services/mockdata.service';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-dashboard',
  imports: [NgFor, AsyncPipe, DecimalPipe, RouterLink, ConfirmModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly title = signal('Tour-Planner');

  private readonly mockDataService = inject(MockDataService);
  readonly tours$ = this.mockDataService.tours$;
  isDeleteModalOpen = false;
  pendingDeleteTourId: number | null = null;

  openDeleteTourModal(id: number) {
    this.pendingDeleteTourId = id;
    this.isDeleteModalOpen = true;
  }

  cancelDeleteTour() {
    this.isDeleteModalOpen = false;
    this.pendingDeleteTourId = null;
  }

  confirmDeleteTour() {
    if (this.pendingDeleteTourId === null) {
      return;
    }
    this.mockDataService.deleteTour(this.pendingDeleteTourId);
    this.cancelDeleteTour();
  }
}
