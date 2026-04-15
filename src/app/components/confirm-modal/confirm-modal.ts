import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {
  title = input<string>('Please confirm');
  message = input<string>('Are you sure?');
  confirmText = input<string>('Confirm');
  cancelText = input<string>('Cancel');

  confirmed = output<void>();
  cancelled = output<void>();
}
