import { Component } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner'


@Component({
  selector: 'fng-loading',
  standalone: true,
  imports: [
    MatProgressSpinner
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  public loading = true;
}
