import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { PILLARS, GROUPS } from '../../data/content';
import { ArticleService } from '../../services/article.service';
import { articleMeta, type Article } from '../../models/article';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIcon],
  templateUrl: './home.html'
})
export class Home {
  private readonly service = inject(ArticleService);
  protected readonly bilingue = true;
  protected readonly pillars = PILLARS;
  protected readonly groups = GROUPS;
  protected readonly meta = articleMeta;
  protected readonly homeArticles = signal<Article[]>([]);

  constructor() {
    this.service.list().subscribe({
      next: (list) => this.homeArticles.set(list.slice(0, 3)),
      error: () => this.homeArticles.set([]),
    });
  }
}
