import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private API = "http://localhost:8080/favoritos";

  constructor(private http: HttpClient) {}

  private getUserId(): number | null {
    const raw = localStorage.getItem('usuarioId') ?? localStorage.getItem('userId');
    if (!raw) return null;
    const n = Number(raw);
    if (!n || isNaN(n) || n <= 0) return null;
    return n;
  }

  private headersWithUserId(): { headers?: HttpHeaders } {
    const uid = this.getUserId();
    if (!uid) return {};
    return { headers: new HttpHeaders({ 'X-User-Id': String(uid) }) };
  }

  checkFavorito(mangaId: number): Observable<any> {
    const uid = this.getUserId();
    if (!uid) return throwError(() => new Error('Usuário não autenticado (userId ausente)'));
    return this.http.get<any>(`${this.API}/check/${mangaId}`, this.headersWithUserId());
  }

  toggleFavorito(mangaId: number): Observable<any> {
    const uid = this.getUserId();
    if (!uid) return throwError(() => new Error('Usuário não autenticado (userId ausente)'));
    return this.http.post<any>(`${this.API}/toggle/${mangaId}`, {}, this.headersWithUserId());
  }

  listarFavoritosUsuario(): Observable<any> {
    const uid = this.getUserId();
    if (!uid) return throwError(() => new Error('Usuário não autenticado (userId ausente)'));
    return this.http.get<any>(`${this.API}/usuario`, this.headersWithUserId());
  }

  topFavoritos(limit = 3): Observable<any> {
    return this.http.get<any>(`${this.API}/top?limit=${limit}`);
  }
}
