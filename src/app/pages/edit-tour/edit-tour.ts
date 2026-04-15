import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { LeafletComponent } from '../../components/leaflet/leaflet.component';
import { MockDataService, Tour, vehicle } from '../../services/mockdata.service';

@Component({
  selector: 'app-edit-tour',
  imports: [RouterLink, FormsModule, LeafletComponent],
  templateUrl: './edit-tour.html',
  styleUrl: './edit-tour.css',
})
export class EditTour implements OnInit {
  private readonly mockDataService = inject(MockDataService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private editTourId: number | null = null;

  title = '';
  author = '';
  description = '';
  vehicleType: vehicle = 'cycling-regular';
  startCoord: {lat: number, lng: number} | null = null;
  endCoord: {lat: number, lng: number} | null = null;

  distance = 0;
  time = 0;

  setDistance(distance: number) {
    this.distance = distance / 1000;
  }

  setTime(time: number) {
    this.time = time / 60;
  }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const editId = Number(idParam);
    if (!idParam || !Number.isFinite(editId)) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    const tour = await firstValueFrom(this.mockDataService.getTourByID(editId));
    if (!tour) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    this.editTourId = tour.id;
    this.title = tour.name;
    this.author = tour.author;
    this.description = tour.description;
    this.vehicleType = tour.vehicleType;
    this.startCoord = tour.startCoordinate;
    this.endCoord = tour.endCoordinate;
  }

  onStartSelected(coord: {lat: number, lng: number}) {
    this.startCoord = coord;
  }

  onEndSelected(coord: {lat: number, lng: number}) {
    this.endCoord = coord;
  }

  isTourFormValid() {
    return this.title.trim().length > 0
      && this.author.trim().length > 0
      && this.description.trim().length > 0
      && this.hasValidCoordinates();
  }

  async saveTour() {
    if (!this.editTourId || !this.isTourFormValid()) {
      alert('Bitte alle Felder ausfüllen und Start/Ende auf der Karte auswählen.');
      return;
    }

    const currentTour = await firstValueFrom(this.mockDataService.getTourByID(this.editTourId));
    if (!currentTour) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    const updatedTour: Tour = {
      id: currentTour.id,
      name: this.title.trim(),
      author: this.author.trim(),
      description: this.description.trim(),
      startCoordinate: this.startCoord!,
      endCoordinate: this.endCoord!,
      vehicleType: this.vehicleType,
      tourComments: currentTour.tourComments,
      distance: this.distance,
      time: this.time
    };

    this.mockDataService.updateTour(updatedTour);
    void this.router.navigate(['/dashboard']);
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
