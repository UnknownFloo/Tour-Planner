import { Routes } from '@angular/router';
import { Test } from './pages/test/test';
import { Dashboard } from './pages/dashboard/dashboard';
import { Tour } from './pages/tour/tour';
import { CreateTour } from './pages/create-tour/create-tour';
import { EditTour } from './pages/edit-tour/edit-tour';
import { Discover } from './pages/discover/discover';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'discover', component: Discover, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'test', component: Test, canActivate: [authGuard] },
  { path: 'tour', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'tour/:id', component: Tour, canActivate: [authGuard] },
  { path: 'create-tour', component: CreateTour, canActivate: [authGuard] },
  { path: 'edit-tour/:id', component: EditTour, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];
