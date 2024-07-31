import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoreService } from '../../../services/app/core.service';
import { LoadingComponent } from '../../atoms/loading/loading.component';

@Component({
  selector: 'fng-main',
  standalone: true,
  imports: [
    RouterOutlet,
    LoadingComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  constructor(
    private coreService: CoreService,
  ) {
  }

  public get isLoading(): boolean {
    return this.coreService.loading;
  }
}
