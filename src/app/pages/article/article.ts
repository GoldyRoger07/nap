import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { ArticleService } from '../../services/article.service';
import { CommunityService } from '../../services/community.service';
import { UserAuthService } from '../../services/user-auth.service';
import { Seo } from '../../seo/seo';
import { SITE_NAME } from '../../seo/seo.config';
import { articleMeta, articleParagraphs, type Article } from '../../models/article';
import type { Comment, LikeInfo } from '../../models/community';

@Component({
  selector: 'app-article',
  imports: [RouterLink, FormsModule, NgIcon],
  templateUrl: './article.html',
})
export class ArticlePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ArticleService);
  private readonly community = inject(CommunityService);
  private readonly userAuth = inject(UserAuthService);
  private readonly seo = inject(Seo);
  protected readonly meta = articleMeta;

  protected readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';
  protected readonly article = signal<Article | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly paragraphs = computed(() => {
    const a = this.article();
    return a ? articleParagraphs(a.body) : [];
  });

  // Communauté
  protected readonly isLoggedIn = this.userAuth.isLoggedIn;
  protected readonly loginLink = computed(() => `/compte`);
  protected readonly likes = signal<LikeInfo>({ count: 0, liked: false });
  protected readonly likePending = signal(false);
  protected readonly comments = signal<Comment[]>([]);
  protected commentBody = '';
  protected readonly commentError = signal('');
  protected readonly commentSubmitting = signal(false);
  protected readonly commentPending = signal(false);

  constructor() {
    this.service.getBySlug(this.slug).subscribe({
      next: (a) => {
        this.article.set(a);
        this.loading.set(false);
        this.seo.update({
          title: `${a.title} — ${SITE_NAME}`,
          description: a.excerpt,
          path: `/actualites/${a.slug}`,
        });
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });

    this.community.likes(this.slug).subscribe({ next: (l) => this.likes.set(l), error: () => {} });
    this.community.comments(this.slug).subscribe({ next: (c) => this.comments.set(c), error: () => {} });
  }

  commentDate(iso: string): string {
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  private goToLogin(): void {
    this.router.navigate(['/compte'], { queryParams: { redirect: `/actualites/${this.slug}` } });
  }

  toggleLike(): void {
    if (!this.isLoggedIn()) {
      this.goToLogin();
      return;
    }
    if (this.likePending()) return;
    this.likePending.set(true);
    this.community.toggleLike(this.slug).subscribe({
      next: (l) => {
        this.likes.set(l);
        this.likePending.set(false);
      },
      error: () => this.likePending.set(false),
    });
  }

  submitComment(): void {
    if (!this.isLoggedIn()) {
      this.goToLogin();
      return;
    }
    const body = this.commentBody.trim();
    if (body.length < 2) {
      this.commentError.set('Votre commentaire est trop court.');
      return;
    }
    this.commentSubmitting.set(true);
    this.commentError.set('');
    this.community.addComment(this.slug, body).subscribe({
      next: () => {
        this.commentSubmitting.set(false);
        this.commentBody = '';
        this.commentPending.set(true); // en attente de modération
      },
      error: (e) => {
        this.commentSubmitting.set(false);
        this.commentError.set(e?.error?.error ?? 'Envoi impossible. Réessayez.');
      },
    });
  }
}
