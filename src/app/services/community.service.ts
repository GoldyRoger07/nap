import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { AdminComment, Comment, LikeInfo } from '../models/community';
import { API_BASE } from './api.token';

/** Commentaires et « j'aime » d'un article (+ modération admin). */
@Injectable({ providedIn: 'root' })
export class CommunityService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE);

  // --- Public / visiteur --------------------------------------------------
  comments(slug: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.base}/api/articles/${encodeURIComponent(slug)}/comments`);
  }

  addComment(slug: string, body: string): Observable<Comment & { status: string }> {
    return this.http.post<Comment & { status: string }>(
      `${this.base}/api/articles/${encodeURIComponent(slug)}/comments`,
      { body },
    );
  }

  likes(slug: string): Observable<LikeInfo> {
    return this.http.get<LikeInfo>(`${this.base}/api/articles/${encodeURIComponent(slug)}/likes`);
  }

  toggleLike(slug: string): Observable<LikeInfo> {
    return this.http.post<LikeInfo>(`${this.base}/api/articles/${encodeURIComponent(slug)}/like`, {});
  }

  // --- Modération admin ---------------------------------------------------
  adminComments(status?: 'pending' | 'approved'): Observable<AdminComment[]> {
    const query = status ? `?status=${status}` : '';
    return this.http.get<AdminComment[]>(`${this.base}/api/admin/comments${query}`);
  }

  approveComment(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/api/admin/comments/${id}/approve`, {});
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/admin/comments/${id}`);
  }
}
