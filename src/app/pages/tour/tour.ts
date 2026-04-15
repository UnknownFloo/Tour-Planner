import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Difficulty, Enjoyment, MockDataService, TourComment } from '../../services/mockdata.service';
import { LeafletComponent } from '../../components/leaflet/leaflet.component';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';


@Component({
  selector: 'app-tour',
  imports: [RouterLink, FormsModule, DecimalPipe, LeafletComponent, ConfirmModal],
  templateUrl: './tour.html',
  styleUrl: './tour.css',
})
export class Tour {
  protected readonly title = signal('Tour-Planner');

  private readonly mockDataService = inject(MockDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  commentTitle = '';
  commentAuthor = '';
  commentDifficulty: Difficulty = 3;
  commentEnjoyment: Enjoyment = 3;
  commentText = '';
  editingCommentId: number | null = null;
  isDeleteTourModalOpen = false;
  isDeleteCommentModalOpen = false;
  private pendingDeleteCommentId: number | null = null;

  distance = 0;
  time = 0;

  tour = toSignal(
    this.route.params.pipe(
      map(params => +params['id']),
      switchMap(id => id ? this.mockDataService.getTourByID(id) : of(null))
    ),
    { initialValue: null }
  );

  deleteCurrentTour() {
    this.isDeleteTourModalOpen = true;
  }

  cancelDeleteCurrentTour() {
    this.isDeleteTourModalOpen = false;
  }

  confirmDeleteCurrentTour() {
    const currentTour = this.tour();
    if (!currentTour) {
      this.cancelDeleteCurrentTour();
      return;
    }
    this.mockDataService.deleteTour(currentTour.id);
    this.cancelDeleteCurrentTour();
    void this.router.navigate(['/dashboard']);
  }

  startEditComment(comment: TourComment) {
    this.editingCommentId = comment.id;
    this.commentTitle = comment.title;
    this.commentAuthor = comment.author;
    this.commentDifficulty = comment.difficulty;
    this.commentEnjoyment = comment.enjoyment;
    this.commentText = comment.comment ?? '';
  }

  cancelEditComment() {
    this.resetCommentForm();
  }

  isCommentFormValid() {
    return this.commentTitle.trim().length > 0 && this.commentAuthor.trim().length > 0;
  }

  saveComment() {
    const currentTour = this.tour();
    if (!currentTour) {
      return;
    }

    if (!this.isCommentFormValid()) {
      alert('Bitte Titel und Autor für den Kommentar ausfüllen.');
      return;
    }

    if (this.editingCommentId !== null) {
      const existingComment = currentTour.tourComments.find((comment) => comment.id === this.editingCommentId);
      if (!existingComment) {
        return;
      }

      this.mockDataService.updateTourComment(currentTour.id, {
        ...existingComment,
        title: this.commentTitle.trim(),
        author: this.commentAuthor.trim(),
        difficulty: this.commentDifficulty,
        enjoyment: this.commentEnjoyment,
        comment: this.commentText.trim() || undefined
      });
    } else {
      this.mockDataService.addTourComment(currentTour.id, {
        title: this.commentTitle.trim(),
        author: this.commentAuthor.trim(),
        difficulty: this.commentDifficulty,
        enjoyment: this.commentEnjoyment,
        comment: this.commentText.trim() || undefined
      });
    }

    this.resetCommentForm();
  }

  requestDeleteComment(commentId: number) {
    const currentTour = this.tour();
    if (!currentTour) {
      return;
    }

    this.pendingDeleteCommentId = commentId;
    this.isDeleteCommentModalOpen = true;
  }

  cancelDeleteComment() {
    this.isDeleteCommentModalOpen = false;
    this.pendingDeleteCommentId = null;
  }

  confirmDeleteComment() {
    const currentTour = this.tour();
    const commentId = this.pendingDeleteCommentId;
    if (!currentTour || commentId === null) {
      this.cancelDeleteComment();
      return;
    }

    this.mockDataService.deleteTourComment(currentTour.id, commentId);
    if (this.editingCommentId === commentId) {
      this.resetCommentForm();
    }
    this.cancelDeleteComment();
  }

  setDistance(distance: number) {
    this.distance = distance / 1000;
  }

  setTime(time: number) {
    this.time = time / 60;
  }

  private resetCommentForm() {
    this.commentTitle = '';
    this.commentAuthor = '';
    this.commentDifficulty = 3;
    this.commentEnjoyment = 3;
    this.commentText = '';
    this.editingCommentId = null;
  }
}
