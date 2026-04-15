import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService, Tour, vehicle } from '../../services/mockdata.service';
import { LeafletComponent } from '../../components/leaflet/leaflet.component';

@Component({
  selector: 'app-create-tour',
  imports: [RouterLink, FormsModule, LeafletComponent],
  templateUrl: './create-tour.html',
  styleUrl: './create-tour.css',
})
export class CreateTour {
  private readonly mockDataService = inject(MockDataService);
  private readonly router = inject(Router);

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

  saveTour() {
    if (!this.isTourFormValid()) {
      alert('Bitte alle Felder ausfüllen und Start/Ende auf der Karte auswählen.');
      return;
    }

    const newTour: Tour = {
      id: Date.now(),
      name: this.title.trim(),
      author: this.author.trim(),
      description: this.description.trim(),
      startCoordinate: this.startCoord!,
      endCoordinate: this.endCoord!,
      vehicleType: this.vehicleType,
      tourComments: [],
      distance: this.distance,
      time: this.time
    };

    this.mockDataService.addTour(newTour);

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