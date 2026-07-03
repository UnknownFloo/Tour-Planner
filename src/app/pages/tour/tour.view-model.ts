import { signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TourService, Tour, TourComment } from '../../services/tour.service';

export class TourViewModel {
  readonly title = signal('Tour-Planner');
  readonly commentTitle = signal('');
  readonly commentDifficulty = signal(3);
  readonly commentEnjoyment = signal(3);
  readonly commentText = signal('');
  readonly editingCommentId = signal<number | null>(null);
  readonly isDeleteTourModalOpen = signal(false);
  readonly isDeleteCommentModalOpen = signal(false);
  readonly pendingDeleteCommentId = signal<number | null>(null);
  readonly distance = signal(0);
  readonly time = signal(0);
  readonly tour = signal<Tour | null>(null);
  readonly isOwner = signal(false);

  constructor(
    private tourService: TourService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    void this.loadTour();
  }

  private async loadTour() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const tourId = Number(idParam);

    if (!idParam || !Number.isFinite(tourId)) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    try {
      const tour = await this.tourService.getTourById(tourId);
      this.tour.set(tour);
      this.isOwner.set(this.isCurrentUserOwner(tour));
    } catch {
      void this.router.navigate(['/dashboard']);
    }
  }

  deleteCurrentTour() {
    this.isDeleteTourModalOpen.set(true);
  }

  async togglePublic() {
    if (!this.canEditTour()) {
      return;
    }

    const currentTour = this.tour();
    if (!currentTour || !currentTour.id) {
      return;
    }

    const updatedTour: Tour = {
      ...currentTour,
      isPublic: !currentTour.isPublic
    };

    const savedTour = await this.tourService.updateTour(currentTour.id, updatedTour);
    this.tour.set(savedTour);
  }

  cancelDeleteCurrentTour() {
    this.isDeleteTourModalOpen.set(false);
  }

  async confirmDeleteCurrentTour() {
    if (!this.canEditTour()) {
      this.cancelDeleteCurrentTour();
      return;
    }

    const currentTour = this.tour();
    if (!currentTour || !currentTour.id) {
      this.cancelDeleteCurrentTour();
      return;
    }

    await this.tourService.deleteTour(currentTour.id);
    this.cancelDeleteCurrentTour();
    void this.router.navigate(['/dashboard']);
  }

  startEditComment(comment: TourComment) {
    if (!this.canEditComment(comment)) {
      return;
    }

    this.editingCommentId.set(comment.id);
    this.commentTitle.set(comment.title);
    this.commentDifficulty.set(comment.difficulty);
    this.commentEnjoyment.set(comment.enjoyment);
    this.commentText.set(comment.comment ?? '');
  }

  cancelEditComment() {
    this.resetCommentForm();
  }

  isCommentFormValid(): boolean {
    return this.commentTitle().trim().length > 0;
  }

  async saveComment() {
    const currentTour = this.tour();
    if (!currentTour || !currentTour.id) {
      return;
    }

    if (!this.isCommentFormValid()) {
      alert('Bitte einen Titel für den Kommentar ausfüllen.');
      return;
    }

    if (this.editingCommentId() !== null) {
      const index = currentTour.tourComments.findIndex(comment => comment.id === this.editingCommentId());
      if (index === -1) {
        return;
      }

      const commentToUpdate = currentTour.tourComments[index];
      if (!this.canEditComment(commentToUpdate)) {
        return;
      }

      const updatedComment: TourComment = {
        ...commentToUpdate,
        title: this.commentTitle().trim(),
        difficulty: this.commentDifficulty(),
        enjoyment: this.commentEnjoyment(),
        comment: this.commentText().trim() || undefined
      };

      const savedComment = await this.tourService.updateLog(currentTour.id, updatedComment.id, updatedComment);
      const updatedComments = [...currentTour.tourComments];
      updatedComments[index] = savedComment;

      this.tour.set({ ...currentTour, tourComments: updatedComments });
    } else {
      const username = this.authService.username() ?? 'Unbekannt';
      const newComment: TourComment = {
        id: 0,
        title: this.commentTitle().trim(),
        author: username,
        authorId: this.authService.userId() ?? undefined,
        difficulty: this.commentDifficulty(),
        enjoyment: this.commentEnjoyment(),
        comment: this.commentText().trim() || undefined
      };

      const createdComment = await this.tourService.addLog(currentTour.id, newComment);
      this.tour.set({ ...currentTour, tourComments: [...currentTour.tourComments, createdComment] });
    }

    this.resetCommentForm();
  }

  requestDeleteComment(commentId: number) {
    const currentTour = this.tour();
    if (!currentTour) {
      return;
    }

    const comment = currentTour.tourComments.find(item => item.id === commentId);
    if (!comment || !this.canEditComment(comment)) {
      return;
    }

    this.pendingDeleteCommentId.set(commentId);
    this.isDeleteCommentModalOpen.set(true);
  }

  async confirmDeleteComment() {
    const currentTour = this.tour();
    const commentId = this.pendingDeleteCommentId();
    if (!currentTour || !currentTour.id || commentId === null) {
      this.cancelDeleteComment();
      return;
    }

    await this.tourService.deleteLog(currentTour.id, commentId);

    const updatedComments = currentTour.tourComments.filter(comment => comment.id !== commentId);
    this.tour.set({ ...currentTour, tourComments: updatedComments });

    if (this.editingCommentId() === commentId) {
      this.resetCommentForm();
    }
    this.cancelDeleteComment();
  }

  cancelDeleteComment() {
    this.isDeleteCommentModalOpen.set(false);
    this.pendingDeleteCommentId.set(null);
  }

  setDistance(distance: number) {
    this.distance.set(distance / 1000);
  }

  setTime(time: number) {
    this.time.set(time / 60);
  }

  private resetCommentForm() {
    this.commentTitle.set('');
    this.commentDifficulty.set(3);
    this.commentEnjoyment.set(3);
    this.commentText.set('');
    this.editingCommentId.set(null);
  }

  canEditTour(): boolean {
    return this.isOwner();
  }

  canEditComment(comment: TourComment): boolean {
    const currentUserId = this.authService.userId();
    if (currentUserId !== null && comment.authorId !== undefined) {
      return currentUserId === comment.authorId;
    }

    return comment.author.toLowerCase() === (this.authService.username() ?? '').toLowerCase();
  }

  private isCurrentUserOwner(tour: Tour): boolean {
    const userName = this.authService.username()?.trim().toLowerCase() ?? '';
    return tour.author?.trim().toLowerCase() === userName && userName.length > 0;
  }
}
