import { Component, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Data, ParamMap } from '@angular/router';

@Component({
  selector: 'app-tes',
  standalone: true,
  imports: [],
  templateUrl: './tes.component.html',
  styleUrl: './tes.component.scss'
})
export class TesComponent implements OnInit {

  private data: Signal<Data | undefined>;
  private queryParamMap: Signal<ParamMap | undefined>;
  private paramMap: Signal<ParamMap | undefined>;

  constructor(
    private route: ActivatedRoute
  ) {
    this.data = toSignal(this.route.data);
    this.queryParamMap = toSignal(this.route.queryParamMap);
    this.paramMap = toSignal(this.route.paramMap);
    console.log(this.data(), this.queryParamMap(), this.paramMap());
  }

  ngOnInit(): void {
    console.log('tes');

    this.route.url.subscribe(segments => {
      if (segments.length > 0) {
        const firstSegment = segments[0].path;
        console.log('First Segment:', firstSegment);
      }
    });
  }
}
