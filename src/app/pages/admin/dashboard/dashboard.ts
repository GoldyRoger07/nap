import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { CommunityService } from '../../../services/community.service';
import { CATEGORIES, articleMeta, slugify, type Article, type ArticleInput } from '../../../models/article';
import type { AdminComment } from '../../../models/community';

interface FormModel {
  id: number | null;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  imgLabel: string;
  date: string;
  readMinutes: number | null;
  published: boolean;
}

function emptyForm(): FormModel {
  return {
    id: null,
    slug: '',
    title: '',
    category: CATEGORIES[0],
    excerpt: '',
    body: '',
    imgLabel: '',
    date: new Date().toISOString().slice(0, 10),
    readMinutes: null,
    published: true,
  };
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, NgIcon],
  templateUrl: './dashboard.html',
})
export class AdminDashboard {
  private readonly service = inject(ArticleService);
  private readonly community = inject(CommunityService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly categories = CATEGORIES;
  protected readonly meta = articleMeta;

  protected readonly section = signal<'articles' | 'comments'>('articles');
  protected readonly articles = signal<Article[]>([]);
  protected readonly loading = signal(true);
  protected readonly mode = signal<'list' | 'edit'>('list');
  protected readonly form = signal<FormModel>(emptyForm());
  protected readonly saving = signal(false);
  protected readonly error = signal('');

  // Modération des commentaires
  protected readonly comments = signal<AdminComment[]>([]);
  protected readonly commentsLoading = signal(false);
  protected readonly pendingCount = computed(
    () => this.comments().filter((c) => c.status === 'pending').length,
  );

  constructor() {
    this.reload();
  }

  showArticles(): void {
    this.section.set('articles');
  }

  showComments(): void {
    this.section.set('comments');
    this.loadComments();
  }

  private loadComments(): void {
    this.commentsLoading.set(true);
    this.community.adminComments().subscribe({
      next: (list) => {
        this.comments.set(list);
        this.commentsLoading.set(false);
      },
      error: (e) => {
        this.commentsLoading.set(false);
        this.handleError(e);
      },
    });
  }

  approveComment(c: AdminComment): void {
    this.community.approveComment(c.id).subscribe({
      next: () => this.loadComments(),
      error: (e) => this.handleError(e),
    });
  }

  deleteComment(c: AdminComment): void {
    if (!confirm('Supprimer ce commentaire ?')) return;
    this.community.deleteComment(c.id).subscribe({
      next: () => this.loadComments(),
      error: (e) => this.handleError(e),
    });
  }

  private reload(): void {
    this.loading.set(true);
    this.service.listAll().subscribe({
      next: (list) => {
        this.articles.set(list);
        this.loading.set(false);
      },
      error: (e) => this.handleError(e),
    });
  }

  patch<K extends keyof FormModel>(key: K, value: FormModel[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  newArticle(): void {
    this.error.set('');
    this.form.set(emptyForm());
    this.mode.set('edit');
  }

  edit(a: Article): void {
    this.error.set('');
    this.form.set({
      id: a.id ?? null,
      slug: a.slug,
      title: a.title,
      category: a.category,
      excerpt: a.excerpt,
      body: a.body,
      imgLabel: a.imgLabel,
      date: a.date,
      readMinutes: a.readMinutes,
      published: a.published,
    });
    this.mode.set('edit');
  }

  cancel(): void {
    this.mode.set('list');
    this.error.set('');
  }

  save(): void {
    const f = this.form();
    if (!f.title.trim() || !f.body.trim()) {
      this.error.set('Le titre et le contenu sont obligatoires.');
      return;
    }
    this.saving.set(true);
    this.error.set('');

    const input: ArticleInput = {
      slug: f.slug.trim() ? slugify(f.slug) : slugify(f.title),
      title: f.title.trim(),
      category: f.category,
      excerpt: f.excerpt.trim(),
      body: f.body,
      imgLabel: f.imgLabel.trim(),
      date: f.date,
      readMinutes: f.readMinutes && f.readMinutes > 0 ? f.readMinutes : 0,
      published: f.published,
    };

    const request = f.id
      ? this.service.update(f.id, input)
      : this.service.create(input);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.mode.set('list');
        this.reload();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(e?.error?.error ?? 'Enregistrement impossible.');
        if (e?.status === 401) this.handleError(e);
      },
    });
  }

  remove(a: Article): void {
    if (!a.id) return;
    if (!confirm(`Supprimer définitivement « ${a.title} » ?`)) return;
    this.service.remove(a.id).subscribe({
      next: () => this.reload(),
      error: (e) => this.handleError(e),
    });
  }

  commentDate(iso: string): string {
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }

  private handleError(e: any): void {
    this.loading.set(false);
    if (e?.status === 401) {
      this.auth.logout();
      this.router.navigateByUrl('/admin/login');
      return;
    }
    this.error.set(e?.error?.error ?? 'Une erreur est survenue.');
  }
}
