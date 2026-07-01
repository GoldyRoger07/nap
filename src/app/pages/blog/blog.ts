import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { CATEGORIES, articleMeta, type Article } from '../../models/article';

@Component({
  selector: 'app-blog',
  imports: [RouterLink],
  templateUrl: './blog.html',
})
export class Blog {
  private readonly service = inject(ArticleService);
  protected readonly meta = articleMeta;

  protected readonly articles = signal<Article[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly chips = ['Tous', ...CATEGORIES];
  protected readonly filter = signal('Tous');

  protected readonly featured = computed(() => this.articles()[0]);
  protected readonly showFeatured = computed(() => this.filter() === 'Tous' && !!this.featured());
  protected readonly gridArticles = computed(() => {
    const list = this.articles();
    return this.filter() === 'Tous'
      ? list.slice(1)
      : list.filter((a) => a.category === this.filter());
  });

  constructor() {
    this.service.list().subscribe({
      next: (list) => {
        this.articles.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }

  setFilter(label: string): void {
    this.filter.set(label);
  }
}
