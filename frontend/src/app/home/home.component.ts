import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FavoritosService } from '../services/favoritos.service';
import { Subscription, interval } from 'rxjs';

type Manga = any; // ajuste com sua interface real se desejar

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  API_BASE = 'http://localhost:8080'; // ajuste se precisar

  // estados usados no template
  recentes: Manga[] = [];
  destaques: Manga[] = [];   // obras com mais favoritos (ordenadas desc)
  favoritos: Manga[] = [];  // obras favoritadas pelo usuário atual
  resultados: any[] = [];
  termo: string = '';
  resultadosVisiveis = false;
  apelido: string | null = null;
  carrossel: any[] = [];

  // carousel / banner
  slideAtual = 0;
  slideIntervalMs = 6000;
  private slideSub?: Subscription;

  // rolagem containers: nomes usados nas setas
  // erro flags
  erroRecentes = false;
  erroDestaques = false;
  erroFavoritos = false;

  // UI: overlay/menu
  menuAtivo = false;
  overlayAtivo = false;
  menuUsuarioAtivo = false;
  logoutAtivo = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private favService: FavoritosService
  ) {}

  ngOnInit(): void {
    this.apelido = localStorage.getItem('apelido') || '';

    // carregar tudo
    this.carregarRecentes();
    this.carregarDestaques();
    this.carregarFavoritosUsuario();

    // iniciar auto-slide do banner
    this.slideSub = interval(this.slideIntervalMs).subscribe(() => {
      this.slideAtual = (this.slideAtual + 1) % 3;
    });

    this.carregarCarrossel();
  }

  ngOnDestroy(): void {
    this.slideSub?.unsubscribe();
  }


  carregarRecentes(): void {
    this.http.get<Manga[]>(`${this.API_BASE}/mangas`)
      .subscribe({
        next: (mangas) => {
          try {
            this.recentes = mangas
              .slice()
              .sort((a, b) => {
                const da = new Date(a.dataPublicacao || a.data_publicacao || 0).getTime();
                const db = new Date(b.dataPublicacao || b.data_publicacao || 0).getTime();
                return db - da;
              })
              .slice(0, 20); // controla quantos mostrar
            this.erroRecentes = false;
          } catch (e) {
            console.warn('Erro ao processar recentes', e);
            this.recentes = [];
            this.erroRecentes = true;
          }
        },
        error: (err) => {
          console.error('Erro ao carregar recentes', err);
          this.recentes = [];
          this.erroRecentes = true;
        }
      });
  }

  carregarCarrossel(): void {
  this.favService.topFavoritos(3).subscribe({
    next: (res) => {
      this.carrossel = res;
    },
    error: (err) => {
      console.error("Erro ao carregar carrossel", err);
      this.carrossel = [];
    }
  });
}


  // ---------------------------
  // DESTAQUES (top N do backend por favoritos)
  // ---------------------------
  carregarDestaques(limit = 10): void {
    this.favService.topFavoritos(limit).subscribe({
      next: (lista: Manga[]) => {
        // backend já deve retornar mangas ordenados por contagem decrescente
        this.destaques = lista || [];
        this.erroDestaques = false;
      },
      error: (err) => {
        console.error('Erro ao carregar destaques', err);
        this.destaques = [];
        this.erroDestaques = true;
      }
    });
  }

  // ---------------------------
  // FAVORITOS DO USUÁRIO
  // ---------------------------
  carregarFavoritosUsuario(): void {
    // FavoritosService deve lançar erro se não houver userId -> tratamos aqui
    this.favService.listarFavoritosUsuario().subscribe({
      next: (lista: Manga[]) => {
        this.favoritos = lista || [];
        this.erroFavoritos = false;
      },
      error: (err) => {
        console.error('Erro ao carregar favoritos do usuário', err);
        // se o erro for "usuário não autenticado", você pode deixar vazio e sugerir login
        this.favoritos = [];
        this.erroFavoritos = true;
      }
    });
  }

  // ---------------------------
  // CARROSSEL: usa os top 3 destaques
  // ---------------------------
  get carouselItems(): Manga[] {
    // se já temos destaques, usa os 3 primeiros; se vazio, usa capas estáticas do template
    return this.destaques.slice(0, 3);
  }

  goToSlide(index: number): void {
    this.slideAtual = index;
  }

  // ---------------------------
  // BUSCA (ao digitar)
  // ---------------------------
  onBuscar(): void {
    const termo = (this.termo || '').trim();
    if (!termo) {
      this.resultados = [];
      this.resultadosVisiveis = false;
      return;
    }

    // seu backend expõe /mangas/buscar?nome=...
    this.http.get<any[]>(`${this.API_BASE}/mangas/buscar?nome=${encodeURIComponent(termo)}`)
      .subscribe({
        next: (r) => {
          this.resultados = r || [];
          this.resultadosVisiveis = true;
        },
        error: (err) => {
          console.warn('Erro na busca', err);
          this.resultados = [];
          this.resultadosVisiveis = true;
        }
      });
  }

  abrirManga(id: number): void {
    // navega para a página de detalhe passando query param id
    this.router.navigate(['/manga-detalhe'], { queryParams: { id } });
  }

  // ---------------------------
  // ROLAR (setas) - identifica container por id e desloca
  // ---------------------------
  rolar(nome: 'recentes' | 'destaques' | 'favoritos', dir: number): void {
    const el = document.getElementById(nome);
    if (!el) return;

    const offset = el.clientWidth * 0.8 * dir; // rola 80% da largura visível
    el.scrollBy({ left: offset, behavior: 'smooth' });
  }

  // ---------------------------
  // NAV / MENU / USUARIO / LOGOUT (pequenas funções utilitárias)
  // ---------------------------
  toggleMenu(): void {
    this.menuAtivo = !this.menuAtivo;
    this.overlayAtivo = this.menuAtivo;
  }

  fecharMenu(): void {
    this.menuAtivo = false;
    this.overlayAtivo = false;
  }

  ir(path: string): void {
    this.router.navigate([path]);
    this.fecharMenu();
  }

  onUsuarioClick(event: MouseEvent): void {
    event.stopPropagation();
    this.menuUsuarioAtivo = !this.menuUsuarioAtivo;
  }

  abrirLogout(): void {
    this.logoutAtivo = true;
    this.menuUsuarioAtivo = false;
  }

  confirmarLogout(): void {
    // limpa localStorage (ajuste conforme seu fluxo de logout)
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('apelido');
    localStorage.removeItem('tipo');
    this.logoutAtivo = false;
    this.apelido = '';
    this.router.navigate(['/login']);
  }

  cancelarLogout(): void {
    this.logoutAtivo = false;
  }
}
