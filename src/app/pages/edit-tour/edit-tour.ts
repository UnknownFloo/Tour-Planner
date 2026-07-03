import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeafletComponent } from '../../components/leaflet/leaflet.component';
import { AuthService } from '../../services/auth.service';
import { TourService } from '../../services/tour.service';
import { EditTourViewModel } from './edit-tour.view-model';

@Component({
  selector: 'app-edit-tour',
  imports: [RouterLink, FormsModule, LeafletComponent],
  templateUrl: './edit-tour.html',
  styleUrl: './edit-tour.css',
})
export class EditTour implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tourService = inject(TourService);

  readonly vm = new EditTourViewModel(this.tourService, this.authService, this.router, this.route);

  ngOnInit() {
    void this.vm.ngOnInit();
  }

  onStartSelected(coord: {lat: number, lng: number}) {
    this.vm.onStartSelected(coord);
  }

  onEndSelected(coord: {lat: number, lng: number}) {
    this.vm.onEndSelected(coord);
  }

  isTourFormValid(): boolean {
    return this.vm.isTourFormValid();
  }

  async saveTour() {
    await this.vm.saveTour();
  }

  setDistance(distance: number) {
    this.vm.setDistance(distance);
  }

  setTime(time: number) {
    this.vm.setTime(time);
  }
}
