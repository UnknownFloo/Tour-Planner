import { Component } from '@angular/core';
import { LeafletComponent } from '../../components/leaflet/leaflet.component';
import * as Leaflet from "leaflet";

@Component({
  selector: 'app-test',
  imports: [LeafletComponent],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test {
  startCordinate = "Not Set";
  endCordinate = "Not Set";

  updateStartCordinate(coords: Leaflet.LatLng) {
    this.startCordinate = `${coords.lat}, ${coords.lng}`;
  }

  updateEndCordinate(coords: Leaflet.LatLng) {
    this.endCordinate = `${coords.lat}, ${coords.lng}`;
  }
}
