import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FireNgineService } from 'fire-ngine';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fire-books';

  constructor (
    private ngineService: FireNgineService
  ) {
    console.log('AppComponent');
  }
}
