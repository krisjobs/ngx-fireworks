import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-parallax',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './parallax.component.html',
  styleUrl: './parallax.component.scss'
})
export class ParallaxComponent {
  @ViewChild('parallaxBackground') parallaxBackground!: ElementRef;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const offset = window.scrollY;
    this.parallaxBackground.nativeElement.style.backgroundPositionY = offset * 0.7 + 'px';
  }

  wow = $localize`wow`;
}
