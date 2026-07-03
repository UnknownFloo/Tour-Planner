import { signal, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TourService, Tour, TourComment, VehicleType } from '../../services/tour.service';

@Injectable()
export class EditTourViewModel {
  private editTourId: number | null = null;

  readonly title = signal('');
  readonly author: any;
  readonly imageUrl = signal('');
  readonly description = signal('');
  readonly vehicleType = signal<VehicleType>('foot-walking');
  readonly startCoord = signal<{ lat: number; lng: number } | null>(null);
  readonly endCoord = signal<{ lat: number; lng: number } | null>(null);
  readonly distance = signal(0);
  readonly time = signal(0);
  readonly isPublic = signal(false);

  constructor(
    private tourService: TourService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.author = signal(this.authService.username() ?? '');
  }

  updateTitle(value: string) {
    (this.title as any).set(value);
  }

  updateDescription(value: string) {
    (this.description as any).set(value);
  }

  updateImageUrl(value: string) {
    (this.imageUrl as any).set(value);
  }

  updateVehicleType(value: VehicleType) {
    (this.vehicleType as any).set(value);
  }

  updateIsPublic(value: boolean) {
    (this.isPublic as any).set(value);
  }

  setDistance(distance: number) {
    this.distance.set(distance / 1000);
  }

  setTime(time: number) {
    this.time.set(time / 60);
  }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const editId = Number(idParam);
    if (!idParam || !Number.isFinite(editId)) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    try {
      const tour = await this.tourService.getOwnedTourById(editId);
      this.editTourId = tour.id ?? null;
      this.title.set(tour.name);
      this.author.set(tour.author ?? '');
      this.description.set(tour.description);
      this.imageUrl.set(tour.imageUrl ?? '');
      this.vehicleType.set(tour.transportType);
      this.startCoord.set(tour.startCoordinate);
      this.endCoord.set(tour.endCoordinate);
      this.distance.set(tour.distance);
      this.time.set(tour.time);
      this.isPublic.set(tour.isPublic ?? false);
    } catch {
      void this.router.navigate(['/dashboard']);
      return;
    }
  }

  onStartSelected(coord: { lat: number; lng: number }) {
    this.startCoord.set(coord);
  }

  onEndSelected(coord: { lat: number; lng: number }) {
    this.endCoord.set(coord);
  }

  isTourFormValid(): boolean {
    return this.title().trim().length > 0
      && this.description().trim().length > 0
      && this.hasValidCoordinates();
  }

  async saveTour() {
    if (!this.editTourId || !this.isTourFormValid()) {
      alert('Bitte alle Felder ausfüllen und Start/Ende auf der Karte auswählen.');
      return;
    }

    const currentTour = await this.tourService.getOwnedTourById(this.editTourId);
    if (!currentTour) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    const updatedTour: Tour = {
      ...currentTour,
      name: this.title().trim(),
      description: this.description().trim(),
      imageUrl: this.imageUrl().trim() || undefined,
      startCoordinate: this.startCoord()!,
      endCoordinate: this.endCoord()!,
      transportType: this.vehicleType(),
      distance: this.distance(),
      time: this.time(),
      isPublic: this.isPublic()
    };

    console.log('Updated tour before save:', {
      name: updatedTour.name,
      description: updatedTour.description,
      startCoordinate: updatedTour.startCoordinate,
      endCoordinate: updatedTour.endCoordinate,
      transportType: updatedTour.transportType,
      distance: updatedTour.distance,
      time: updatedTour.time,
      isPublic: updatedTour.isPublic
    });

    await this.tourService.updateTour(this.editTourId, updatedTour);
    void this.router.navigate(['/dashboard']);
  }

  private hasValidCoordinates(): boolean {
    const start = this.startCoord();
    const end = this.endCoord();

    if (!start || !end) {
      return false;
    }

    const hasValidStart = Number.isFinite(start.lat) && Number.isFinite(start.lng);
    const hasValidEnd = Number.isFinite(end.lat) && Number.isFinite(end.lng);
    return hasValidStart && hasValidEnd;
  }
}
