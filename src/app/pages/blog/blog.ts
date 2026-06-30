import { Component, computed, signal } from '@angular/core';
import { ARTICLES, CATEGORIES } from '../../data/content';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.html'
})
export class Blog {
  protected readonly articles = ARTICLES;
  protected readonly chips = ['Tous', ...CATEGORIES];
  protected readonly filter = signal('Tous');

  protected readonly featured = ARTICLES[0];
  protected readonly showFeatured = computed(() => this.filter() === 'Tous');
  protected readonly gridArticles = computed(() =>
    this.filter() === 'Tous'
      ? this.articles.slice(1)
      : this.articles.filter((a) => a.category === this.filter())
  );

  setFilter(label: string) {
    this.filter.set(label);
  }
}
