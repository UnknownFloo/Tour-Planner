import { Routes } from '@angular/router';
import { Test } from './pages/test/test';
import { Dashboard } from './pages/dashboard/dashboard';
import { Tour } from './pages/tour/tour';
import { CreateTour } from './pages/create-tour/create-tour';
import { EditTour } from './pages/edit-tour/edit-tour';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: "dashboard", component: Dashboard },
  { path: 'test', component: Test },
  { path: "tour/:id" , component: Tour },
  { path: "create-tour", component: CreateTour },
  { path: "edit-tour/:id", component: EditTour }
];
