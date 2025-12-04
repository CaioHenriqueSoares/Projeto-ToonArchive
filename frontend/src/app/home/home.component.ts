import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  API_BASE = 'http://localhost:8080';

  // UI state
  menuAtivo = false;
  overlayAtivo = false;
  menuUsuarioAtivo = false;
  logoutAtivo = false;

  // Carrossel
  slideAtual = 0;
  private slideTimer?: any;

  // Busca
  termo = '';
  resultados: any[] = [];
  resultadosVisiveis = false;

  // Dados
  recentes: any[] = [];
  erroRecentes = false;

  destaques = [
    { img: 'assets/CapaMangaBleach.png', titulo: 'Bleach' },
    { img: 'assets/CapaMangaSoloLeveling.png', titulo: 'Solo Leveling' },
    { img: 'assets/CapaMangaGachiakuta.png', titulo: 'Gachiakuta' }
  ];
  favoritos = [
    { img: 'assets/CapaHqMotoqueiroFantasma.png', titulo: 'Motoqueiro Fantasma' },
    { img: 'assets/CapaHqTartarugasNinja.png', titulo: 'Tartarugas Ninjas' },
    { img: 'assets/CapaMangaGkkg.png', titulo: 'Gokurakugai' }
  ];

  apelido = localStorage.getItem('apelido') || '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.carregarRecentes();
    this.slideTimer = setInterval(() => this.goToSlide(this.slideAtual + 1), 5000);
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  // Header/menu
  toggleMenu() { this.menuAtivo = !this.menuAtivo; this.overlayAtivo = this.menuAtivo; }
  fecharMenu() { this.menuAtivo = false; this.overlayAtivo = false; }
  onUsuarioClick(e: MouseEvent) { e.stopPropagation(); this.menuUsuarioAtivo = !this.menuUsuarioAtivo; }
  @HostListener('document:click') onDocClick() { this.menuUsuarioAtivo = false; }

  // Navegação
  ir(path: string) { this.router.navigate([path]); }

  // Carrossel
  goToSlide(i: number) {
    const total = 3;
    this.slideAtual = (i + total) % total;
  }

  // Listas horizontais
  rolar(id: string, direcao: number) {
    const el = document.getElementById(id);
    if (el) el.scrollBy({ left: 300 * direcao, behavior: 'smooth' });
  }

  // Recentes
  carregarRecentes() {
    this.erroRecentes = false;
    this.http.get<any[]>(`${this.API_BASE}/mangas`).subscribe({
      next: (mangas) => {
        this.recentes = (mangas || []).sort(
          (a, b) => new Date(b?.dataPublicacao || 0).getTime() - new Date(a?.dataPublicacao || 0).getTime()
        );
      },
      error: () => { this.erroRecentes = true; }
    });
  }

  // Busca
  onBuscar() {
    const t = this.termo.trim();
    if (t.length < 2) { this.resultados = []; this.resultadosVisiveis = false; return; }
    this.http.get<any[]>(`${this.API_BASE}/mangas/buscar?nome=${encodeURIComponent(t)}`).subscribe({
      next: (mangas) => { this.resultados = mangas || []; this.resultadosVisiveis = true; },
      error: () => { this.resultados = []; this.resultadosVisiveis = true; }
    });
  }

  abrirManga(id: any) {
  this.router.navigate(['/manga-detalhe'], { queryParams: { id } });
}

  // Logout
  abrirLogout() { this.logoutAtivo = true; }
  cancelarLogout() { this.logoutAtivo = false; }
  confirmarLogout() {
  localStorage.removeItem('usuario');
  sessionStorage.clear();
  this.logoutAtivo = false;
  this.menuUsuarioAtivo = false;
  this.router.navigate(['/login']);
  }
}
