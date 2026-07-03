import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoginViewModel } from './login.view-model';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule, RouterLink, NgIf],
  standalone: true
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly vm = new LoginViewModel(this.authService, this.router);
}
