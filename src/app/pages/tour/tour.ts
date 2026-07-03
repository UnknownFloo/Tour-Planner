import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgIf } from '@angular/common';
import { TourService, TourComment } from '../../services/tour.service';
import { AuthService } from '../../services/auth.service';
import { LeafletComponent } from '../../components/leaflet/leaflet.component';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { TourViewModel } from './tour.view-model';

@Component({
  selector: 'app-tour',
  imports: [RouterLink, FormsModule, NgIf, DecimalPipe, LeafletComponent, ConfirmModal],
  templateUrl: './tour.html',
  styleUrl: './tour.css',
})
export class Tour {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tourService = inject(TourService);
  private authService = inject(AuthService);

  readonly vm = new TourViewModel(this.tourService, this.authService, this.route, this.router);

  startEditComment(comment: TourComment) {
    this.vm.startEditComment(comment);
  }

  cancelEditComment() {
    this.vm.cancelEditComment();
  }

  isCommentFormValid(): boolean {
    return this.vm.isCommentFormValid();
  }

  saveComment() {
    this.vm.saveComment();
  }

  requestDeleteComment(commentId: number) {
    this.vm.requestDeleteComment(commentId);
  }

  cancelDeleteComment() {
    this.vm.cancelDeleteComment();
  }

  confirmDeleteComment() {
    this.vm.confirmDeleteComment();
  }

  setDistance(distance: number) {
    this.vm.setDistance(distance);
  }

  setTime(time: number) {
    this.vm.setTime(time);
  }
}
