import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DiscoverViewModel } from './discover.view-model';

@Component({
  selector: 'app-discover',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './discover.html',
  styleUrl: './discover.css',
  standalone: true
})
export class Discover {
  readonly vm = new DiscoverViewModel();
}
