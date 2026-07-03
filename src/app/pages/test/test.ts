import { Component } from '@angular/core';
import { LeafletComponent } from '../../components/leaflet/leaflet.component';
import * as Leaflet from 'leaflet';
import { TestViewModel } from './test.view-model';

@Component({
  selector: 'app-test',
  imports: [LeafletComponent],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test {
  readonly vm = new TestViewModel();

  updateStartCoordinate(coords: Leaflet.LatLng) {
    this.vm.updateStartCoordinate(coords);
  }

  updateEndCoordinate(coords: Leaflet.LatLng) {
    this.vm.updateEndCoordinate(coords);
  }
}
