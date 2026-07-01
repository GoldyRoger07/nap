import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Article, ArticleInput } from '../models/article';
import { API_BASE } from './api.token';

/** Accès aux articles : lecture publique et gestion admin. */
@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE);

  // --- Public -------------------------------------------------------------
  list(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/api/articles`);
  }

  getBySlug(slug: string): Observable<Article> {
    return this.http.get<Article>(`${this.base}/api/articles/${encodeURIComponent(slug)}`);
  }

  // --- Admin --------------------------------------------------------------
  listAll(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/api/admin/articles`);
  }

  create(input: ArticleInput): Observable<Article> {
    return this.http.post<Article>(`${this.base}/api/admin/articles`, input);
  }

  update(id: number, input: ArticleInput): Observable<Article> {
    return this.http.put<Article>(`${this.base}/api/admin/articles/${id}`, input);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/admin/articles/${id}`);
  }
}
