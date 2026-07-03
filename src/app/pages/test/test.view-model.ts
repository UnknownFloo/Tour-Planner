import { signal } from '@angular/core';
import * as Leaflet from 'leaflet';

export class TestViewModel {
  readonly startCoordinate = signal('Not Set');
  readonly endCoordinate = signal('Not Set');

  updateStartCoordinate(coords: Leaflet.LatLng) {
    this.startCoordinate.set(`${coords.lat}, ${coords.lng}`);
  }

  updateEndCoordinate(coords: Leaflet.LatLng) {
    this.endCoordinate.set(`${coords.lat}, ${coords.lng}`);
  }
}
