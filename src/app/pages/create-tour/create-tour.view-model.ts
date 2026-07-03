import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TourService, Tour, VehicleType } from '../../services/tour.service';

export class CreateTourViewModel {
  title = '';
  author: string;
  imageUrl = '';
  description = '';
  transportType: VehicleType = 'foot-walking';
  vehicleType: VehicleType = 'foot-walking';
  startCoord: { lat: number; lng: number } | null = null;
  endCoord: { lat: number; lng: number } | null = null;
  distance = 0;
  time = 0;
  isPublic = false;
  error = '';
  isLoading = false;

  constructor(
    private readonly tourService: TourService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.author = this.authService.username() ?? '';
  }

  setDistance(distance: number) {
    this.distance = distance / 1000;
  }

  setTime(time: number) {
    this.time = time / 60;
  }

  onStartSelected(coord: { lat: number; lng: number }) {
    this.startCoord = coord;
  }

  onEndSelected(coord: { lat: number; lng: number }) {
    this.endCoord = coord;
  }

  isTourFormValid() {
    return this.title.trim().length > 0
      && this.description.trim().length > 0
      && this.hasValidCoordinates();
  }

  async saveTour() {
    if (!this.isTourFormValid()) {
      this.error = 'Bitte fülle alle erforderlichen Felder aus.';
      return false;
    }

    try {
      this.isLoading = true;
      this.error = '';

      const newTour: Tour = {
        name: this.title.trim(),
        description: this.description.trim(),
        startCoordinate: { lat: this.startCoord!.lat, lng: this.startCoord!.lng },
        endCoordinate: { lat: this.endCoord!.lat, lng: this.endCoord!.lng },
        transportType: this.transportType,
        vehicleType: this.vehicleType,
        distance: this.distance,
        time: Math.round(this.time),
        imageUrl: this.imageUrl.trim() || undefined,
        isPublic: this.isPublic,
        author: this.author,
        tourComments: []
      };

      await this.tourService.createTour(newTour);
      await this.router.navigate(['/dashboard']);
      return true;
    } catch (err: any) {
      this.error = err?.error?.details || 'Fehler beim Speichern der Tour. Bitte versuche es erneut.';
      console.error('Error saving tour:', err);
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  private hasValidCoordinates() {
    if (!this.startCoord || !this.endCoord) {
      return false;
    }

    const hasValidStart = Number.isFinite(this.startCoord.lat) && Number.isFinite(this.startCoord.lng);
    const hasValidEnd = Number.isFinite(this.endCoord.lat) && Number.isFinite(this.endCoord.lng);
    return hasValidStart && hasValidEnd;
  }
}
