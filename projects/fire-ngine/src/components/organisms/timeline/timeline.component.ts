// scrolling-timeline.component.ts
import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';


interface TimelineEvent {
  date: string;
  title: string;
  topPosition: number;
  imageSrc: string;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  standalone: true,
})
export class TimelineComponent {

}
