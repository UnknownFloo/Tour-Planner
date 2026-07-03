import { inject, signal } from '@angular/core';
import { TourService, Tour } from '../../services/tour.service';

export class DashboardViewModel {
  readonly tours = signal<Tour[]>([]);
  readonly selectedTourIds = signal<Set<number>>(new Set());
  readonly isDeleteModalOpen = signal(false);
  readonly pendingDeleteTourId = signal<number | null>(null);
  readonly toastMessage = signal('');
  readonly toastType = signal<'success' | 'error' | 'info'>('info');
  readonly isToastVisible = signal(false);
  private toastTimeoutId: number | null = null;

  constructor(private tourService: TourService) {
    void this.loadTours();
  }

  private async loadTours() {
    const tours = await this.tourService.getAllTours();
    this.tours.set(tours);
  }

  openDeleteTourModal(id: number) {
    this.pendingDeleteTourId.set(id);
    this.isDeleteModalOpen.set(true);
  }

  cancelDeleteTour() {
    this.isDeleteModalOpen.set(false);
    this.pendingDeleteTourId.set(null);
  }

  async confirmDeleteTour() {
    const tourId = this.pendingDeleteTourId();
    if (tourId === null) {
      return;
    }

    await this.tourService.deleteTour(tourId);
    this.tours.set(this.tourService.tours());
    this.cancelDeleteTour();
    this.showToast('Tour gelöscht.', 'success');
  }

  isTourSelected(id: number | undefined): boolean {
    return id === undefined ? false : this.selectedTourIds().has(id);
  }

  toggleTourSelection(id: number | undefined) {
    if (id === undefined) {
      return;
    }

    const current = new Set(this.selectedTourIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedTourIds.set(current);
  }

  exportSelectedTours() {
    const selectedIds = Array.from(this.selectedTourIds());
    const tours = this.tourService.tours();
    const selectedTours = selectedIds.length > 0
      ? tours.filter(t => selectedIds.includes(t.id ?? -1))
      : tours;

    if (selectedTours.length === 0) {
      this.showToast('Es sind keine Touren zum Exportieren vorhanden.', 'error');
      return;
    }

    const json = JSON.stringify(selectedTours, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tours_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.selectedTourIds.set(new Set());
    const count = selectedTours.length;
    const message = selectedIds.length > 0
      ? `${count} ausgewählte Tour${count === 1 ? '' : 'en'} wurden exportiert.`
      : `${count} Tour${count === 1 ? '' : 'en'} wurden exportiert.`;
    this.showToast(message, 'success');
  }

  async importTours(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const importedTours = JSON.parse(content) as Tour[];
        if (!Array.isArray(importedTours)) {
          throw new Error('Invalid JSON');
        }

        for (const imported of importedTours) {
          await this.tourService.createTour({
            name: imported.name,
            description: imported.description,
            startCoordinate: imported.startCoordinate,
            endCoordinate: imported.endCoordinate,
            transportType: imported.transportType,
            vehicleType: imported.vehicleType ?? imported.transportType,
            distance: imported.distance,
            time: imported.time,
            imageUrl: imported.imageUrl,
            isPublic: imported.isPublic,
            author: imported.author,
            tourComments: imported.tourComments ?? []
          });
        }

        this.showToast('Tours erfolgreich importiert.', 'success');
      } catch {
        this.showToast('Fehler beim Importieren. Bitte überprüfe die Datei.', 'error');
      }
    };
    reader.readAsText(file);
    (event.target as HTMLInputElement).value = '';
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.isToastVisible.set(true);

    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.isToastVisible.set(false);
      this.toastTimeoutId = null;
    }, 2200);
  }
}
