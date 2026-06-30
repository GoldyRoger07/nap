import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { PILLARS, GROUPS, ARTICLES } from '../../data/content';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIcon],
  templateUrl: './home.html'
})
export class Home {
  protected readonly bilingue = true;
  protected readonly pillars = PILLARS;
  protected readonly groups = GROUPS;
  protected readonly homeArticles = ARTICLES.slice(0, 3);
}
