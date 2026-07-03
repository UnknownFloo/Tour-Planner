import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RegisterViewModel } from './register.view-model';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  imports: [FormsModule, RouterLink, NgIf],
  standalone: true
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly vm = new RegisterViewModel(this.authService, this.router);
}
