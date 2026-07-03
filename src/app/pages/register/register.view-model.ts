import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export class RegisterViewModel {
  username = '';
  password = '';
  readonly error = signal('');

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  async submit() {
    this.error.set('');
    try {
      await this.authService.register({
        username: this.username,
        password: this.password,
      });
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error.set('Registrierung fehlgeschlagen. Bitte versuche es erneut.');
    }
  }
}
