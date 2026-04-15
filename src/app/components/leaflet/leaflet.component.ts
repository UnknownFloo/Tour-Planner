import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, input, output } from '@angular/core';
import * as Leaflet from "leaflet";

type vehicle = "driving-car" | "cycling-regular" | "cycling-road" | "cycling-mountain" | "cycling-electric" | "foot-walking" | "foot-hiking"

const iconDefault = Leaflet.icon({
  iconRetinaUrl: 'marker-icon-2x.png',
  iconUrl: 'marker-icon.png',
  shadowUrl: 'marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
Leaflet.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-leaflet',
  imports: [],
  templateUrl: './leaflet.component.html',
  styleUrls: ['./leaflet.component.css'],
})
export class LeafletComponent implements OnInit, OnDestroy, OnChanges {
  interactable = input<true | false>(false);
  startCoordinateClicked = output<Leaflet.LatLng>();
  endCoordinateClicked = output<Leaflet.LatLng>();

  distance = output<number>();
  time = output<number>();

  startCoords = input<{lat: number, lng: number}>();
  endCoords = input<{lat: number, lng: number}>();
  vehicleType = input<vehicle>('cycling-regular');

  private map!: Leaflet.Map;
  private routeLayer?: Leaflet.GeoJSON;

  private startMarker: Leaflet.Marker | null = null;
  private endMarker: Leaflet.Marker | null = null;
  private nextClickUpdates: 'start' | 'end' = 'start';

  private readonly ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImZlYTk2OTQ2MzFiYzQ4ZjA5NWEwNzdjYmQ2MDQ2YmJjIiwiaCI6Im11cm11cjY0In0=';


  private readonly resizeHandler = (): void => {
    if (this.map) {
      this.map.invalidateSize();
    }
  };

  ngOnInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) {
      return;
    }
    if (changes['startCoords'] || changes['endCoords'] || changes['vehicleType']) {
      void this.syncRouteFromInputs();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = Leaflet.map('map', {
      center: [48.2082, 16.3738], // Wien
      zoom: 12
    });

    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© Tour-Planer'
    }).addTo(this.map);

    window.addEventListener('resize', this.resizeHandler);
    void setTimeout(() => this.map.invalidateSize(), 0);

    void this.syncRouteFromInputs();

    if(this.interactable()){
      this.map.on('click', async (e: L.LeafletMouseEvent) => {
        if (!this.startMarker) {
          this.startMarker = Leaflet.marker(e.latlng, { draggable: false }).addTo(this.map).bindPopup('Start Point').openPopup();
          this.startCoordinateClicked.emit(e.latlng);
          this.nextClickUpdates = 'end';
          return;
        }

        if (!this.endMarker) {
          this.endMarker = Leaflet.marker(e.latlng, { draggable: false }).addTo(this.map).bindPopup('End Point').openPopup();
          this.endCoordinateClicked.emit(e.latlng);
          await this.getRoute(
            {lat: this.startMarker.getLatLng().lat, lng: this.startMarker.getLatLng().lng}, 
            {lat: this.endMarker.getLatLng().lat, lng: this.endMarker.getLatLng().lng},
            this.vehicleType()
          );
          this.nextClickUpdates = 'start';
          return;
        }

        if (this.nextClickUpdates === 'start') {
          this.startMarker.setLatLng(e.latlng);
          this.startMarker.bindPopup('Start Point').openPopup();
          this.startCoordinateClicked.emit(e.latlng);
          this.nextClickUpdates = 'end';
        } else {
          this.endMarker.setLatLng(e.latlng);
          this.endMarker.bindPopup('End Point').openPopup();
          this.endCoordinateClicked.emit(e.latlng);
          this.nextClickUpdates = 'start';
        }

        await this.getRoute(
          { lat: this.startMarker.getLatLng().lat, lng: this.startMarker.getLatLng().lng },
          { lat: this.endMarker.getLatLng().lat, lng: this.endMarker.getLatLng().lng },
          this.vehicleType()
        );
      });
    }
    
  }

  private async syncRouteFromInputs() {
    const start = this.startCoords();
    const end = this.endCoords();

    if (!start || !end) {
      return;
    }

    if (this.startMarker) {
      this.startMarker.remove();
    }
    if (this.endMarker) {
      this.endMarker.remove();
    }

    this.startMarker = Leaflet.marker(start, { draggable: false }).addTo(this.map).bindPopup('Start Point').openPopup();
    this.endMarker = Leaflet.marker(end, { draggable: false }).addTo(this.map).bindPopup('End Point');

    await this.getRoute(start, end, this.vehicleType());
  }

  private async getRoute(start: {lat: number, lng: number}, end: {lat: number, lng: number}, type: vehicle){
    const url = `https://api.openrouteservice.org/v2/directions/${type}/geojson`;

    const body = {
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat]
      ]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.ORS_API_KEY
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error(`ORS Fehler: ${response.status}`);

      const geojson = await response.json();

      // Alte Route entfernen
      this.routeLayer?.remove();

      console.log(JSON.stringify(geojson, null, 2));

      this.distance.emit(geojson.features[0].properties.summary.distance);
      this.time.emit(geojson.features[0].properties.summary.duration);

      // Neue Route zeichnen
      this.routeLayer = Leaflet.geoJSON(geojson, {
        style: {
          color: '#0078ff',
          weight: 5,
          opacity: 0.8
        }
      }).addTo(this.map);

      // Karte auf Route zoomen
      this.map.fitBounds(this.routeLayer.getBounds(), { padding: [40, 40] });

    } catch (err) {
      console.error('Route konnte nicht geladen werden:', err);
    }
  }
}
