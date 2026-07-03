import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})

export class App {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout() {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
