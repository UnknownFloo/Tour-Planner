import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TourService } from '../../services/tour.service';
import { LeafletComponent } from '../../components/leaflet/leaflet.component';
import { CreateTourViewModel } from './create-tour.view-model';

@Component({
  selector: 'app-create-tour',
  imports: [RouterLink, FormsModule, LeafletComponent],
  templateUrl: './create-tour.html',
  styleUrl: './create-tour.css',
})
export class CreateTour {
  private readonly tourService = inject(TourService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly vm = new CreateTourViewModel(this.tourService, this.authService, this.router);

}
