import { Component } from '@angular/core';
import { VALUES } from '../../data/content';

@Component({
  selector: 'app-apropos',
  templateUrl: './apropos.html'
})
export class Apropos {
  protected readonly values = VALUES;
}
