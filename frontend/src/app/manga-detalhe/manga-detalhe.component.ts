import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritosService } from '../services/favoritos.service';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-manga-detalhe',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './manga-detalhe.component.html',
  styleUrls: ['./manga-detalhe.component.css']
})
export class MangaDetalheComponent implements OnInit {

  API = 'http://localhost:8080';

  // propriedades usadas pelo template
  manga: any = null;
  capitulos: any[] = [];
  comentarios: any[] = [];

  comentarioTexto: string = '';
  isAdmin: boolean = false;
  isAuthor: boolean = false;
  usuarioAtual: string = '';
  isFav = false;
  favoritoLoading: boolean = false;
  deletingManga: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private favService: FavoritosService
  ) { }

  ngOnInit(): void {
    // ler usuario/admin antes de carregar comentários
    this.usuarioAtual = (localStorage.getItem('apelido') || '').trim();
    this.isAdmin = localStorage.getItem('tipo') === 'admin';
    

    this.route.queryParamMap.subscribe(params => {
    // Declara o ID como string | null
    const id = params.get('id'); 
    
    // VERIFICAÇÃO DE NULIDADE: Só chama as funções se o ID não for nulo!
    if (id) {
      // Chama a função de carregamento
      this.carregarManga(id);
      this.carregarCapitulos(id); 
      this.carregarComentarios(id); 
      this.carregarStatusFavorito();
    } else {
      // Opcional: Redirecionar para uma página de erro ou home
      console.error("ID do mangá não encontrado na URL.");
      // this.router.navigate(['/home']); 
    }
  });
  }

  // --- carregamento de dados ---
  carregarManga(id: string) {
  this.manga = null; 
  this.http.get<any>(`${this.API}/mangas/${id}`)
    .subscribe({
      next: (m) => {
        this.manga = m; 
        this.capitulos = m.capitulos || []; 
        this.isAuthor = this.manga.autor === this.usuarioAtual;
        this.atualizarPermissoesPorManga();
        this.carregarStatusFavorito();
      },
      error: (err) => {
        console.error('Erro ao carregar mangá:', err);
        this.manga = {
          nome: 'Falha ao Carregar',
          descricao: 'Não foi possível carregar os detalhes do mangá. Tente novamente mais tarde.',
          capa: '', autor: '', editora: '', ano: ''
        };
        this.capitulos = [];
        this.isAuthor = false;
      }
    });
}

private normalizarAutor(m: any): string {
    if (!m) return '';
    if (typeof m.autor === 'string') return m.autor;
    if (typeof m.autor === 'object' && m.autor !== null) {
      return (m.autor.apelido || m.autor.username || m.autor.nome || '').toString();
    }
    return '';
  }


  private atualizarPermissoesPorManga(): void {
    // mantém sua lógica, mas usa normalizarAutor
    const autorNormalized = (this.normalizarAutor(this.manga) || '').toString().trim();
    const usuarioNormalized = (this.usuarioAtual || '').toString().trim();
    if (autorNormalized && usuarioNormalized) {
      this.isAuthor = usuarioNormalized.toLowerCase() === autorNormalized.toLowerCase();
    } else {
      const autorId = this.manga?.autor?.id ?? this.manga?.autor?.userId ?? null;
      const userIdLocal = localStorage.getItem('userId') || localStorage.getItem('usuarioId') || null;
      if (autorId && userIdLocal) {
        this.isAuthor = String(autorId) === String(userIdLocal);
      } else {
        this.isAuthor = false;
      }
    }
  }

  private getUserIdOrWarn(): number | null {
  const raw = localStorage.getItem('usuarioId') ?? localStorage.getItem('userId');
  const n = Number(raw);
  if (!raw || !n || isNaN(n) || n <= 0) {
    alert('Você precisa estar logado (userId ausente). Para testes, defina localStorage.setItem(\"usuarioId\",\"<seu-id>\") no console.');
    return null;
  }
  return n;
}

   private carregarStatusFavorito(): void {
    const id = this.manga?.id ?? this.route.snapshot.queryParamMap.get('id');
    if (!id) return;
    if (!this.getUserIdOrWarn()) return;

    // Usamos o service (que faz HTTP) — subscribe deve existir
    this.favService.checkFavorito(id).subscribe({
      next: (res: any) => {
        this.isFav = !!res?.favorito;
      },
      error: (err: any) => {
        console.warn('Erro ao checar favorito', err);
        this.isFav = false;
      }
    });
  }

onToggleFavorito(): void {
  const id = Number(this.manga?.id ?? this.route.snapshot.queryParamMap.get('id'));
  if (!id) return;
  if (!this.getUserIdOrWarn()) return;

  const prev = this.isFav;
  this.isFav = !prev;
  this.favoritoLoading = true;

  this.favService.toggleFavorito(id).subscribe({
    next: (res: any) => {
      this.isFav = !!res?.favorito;
      this.favoritoLoading = false;
    },
    error: (err: any) => {
      console.error('Erro ao alternar favorito', err);
      this.isFav = prev;
      this.favoritoLoading = false;
    }
  });
}



  carregarCapitulos(id: string): void {
    this.http.get<any[]>(`${this.API}/capitulos/manga/${id}`)
      .subscribe((caps) => {
        this.capitulos = caps;
      });
  }

  carregarComentarios(id: string): void {
    this.http.get<any[]>(`${this.API}/comentarios/manga/${id}`)
      .subscribe((coms) => {
        // adiciona flags locais para UI (edição / confirmação)
        this.comentarios = coms.map(c => ({
          ...c,
          emEdicao: false,
          textoEditado: c.texto,
          confirmandoExclusao: false
        }));
      });
  }

  // --- permissão para editar/excluir ---
  podeGerirComentario(c: any): boolean {
    const autor = (c?.autor || '').trim();
    const usuario = (this.usuarioAtual || '').trim();
    // compara sensível à caixa, ajuste se quiser case-insensitive
    return this.isAdmin || (!!usuario && usuario === autor);
  }

  // --- envio de comentário ---
  enviarComentario(): void {
    const mangaId = this.route.snapshot.queryParamMap.get('id');
    const texto = (this.comentarioTexto || '').trim();

    if (!mangaId || !texto) return;

    const autor = this.usuarioAtual || 'Anônimo';

    this.http.post(`${this.API}/comentarios`, {
      autor,
      texto,
      manga: { id: Number(mangaId) }
    }).subscribe(() => {
      this.comentarioTexto = '';
      this.carregarComentarios(mangaId);
    });
  }

  // --- edição inline ---
  iniciarEdicao(c: any): void {
    c.emEdicao = true;
    c.confirmandoExclusao = false;
    c.textoEditado = c.texto;
  }

  cancelarEdicao(c: any): void {
    c.emEdicao = false;
    c.textoEditado = c.texto;
  }

  salvarEdicao(c: any): void {
    // debug rápido
    console.log('[DEBUG] salvarEdicao chamado para id=', c?.id, 'textoEditado=', c?.textoEditado);

    const novoTexto = (c.textoEditado || '').trim();
    if (!novoTexto) {
      // nada a salvar (ou texto vazio)
      c.emEdicao = false;
      c.textoEditado = c.texto;
      return;
    }

    // bloqueia múltiplos clicks
    c.saving = true;

    const payload = { texto: novoTexto };

    this.http.put(`${this.API}/comentarios/${c.id}`, payload)
      .subscribe({
        next: (res: any) => {
          // se a API retornou o comentário atualizado, usa; senão atualiza localmente
          if (res && res.texto !== undefined) {
            c.texto = res.texto;
          } else {
            c.texto = novoTexto;
          }
          c.emEdicao = false;
          c.saving = false;
          console.log('[DEBUG] salvarEdicao sucesso', c.id);
        },
        error: (err) => {
          c.saving = false;
          console.error('[DEBUG] salvarEdicao erro', err);
          alert('Não foi possível salvar o comentário. Verifique a conexão ou tente novamente.');
        }
      });
  }


  // --- exclusão com confirmação inline ---
  pedirConfirmacaoExclusao(c: any): void {
    c.confirmandoExclusao = true;
    c.emEdicao = false;
  }

  cancelarExclusao(c: any): void {
    c.confirmandoExclusao = false;
  }

  confirmarExclusao(c: any): void {
    this.http.delete(`${this.API}/comentarios/${c.id}`)
      .subscribe(() => {
        this.comentarios = this.comentarios.filter(x => x.id !== c.id);
      }, () => {
        // opcional: tratar erro
      });
  }

  // wrapper do editar (mantém compatibilidade com templates que chamam editarComentario)
  editarComentario(c: any): void {
    this.iniciarEdicao(c);
  }

  // inicia confirmação (use isso no template: (click)="iniciarExclusao(c)" )
  iniciarExclusao(c: any): void {
    this.pedirConfirmacaoExclusao(c);
  }

  async excluirManga(): Promise<void> {
    // proteção extra
    if (!this.manga || !this.manga.id) return;

    const confirmacao = confirm(`Tem certeza que deseja excluir o mangá "${this.manga.nome}"? Esta ação é irreversível.`);
    if (!confirmacao) return;

    this.deletingManga = true;

    try {
      // chama endpoint de delete
      await lastValueFrom(this.http.delete(`${this.API}/mangas/${this.manga.id}`, { observe: 'response' } as any));
      // sucesso — redireciona para home e notifica
      alert('Mangá excluído com sucesso.');
      this.router.navigate(['/home']);
    } catch (err: any) {
      console.error('Erro ao excluir mangá:', err);
      // tenta extrair mensagem amigável
      const msg = err?.error && typeof err.error === 'string' ? err.error : 'Não foi possível excluir o mangá. Tente novamente.';
      alert(msg);
    } finally {
      this.deletingManga = false;
    }
  }

  // --- navegação ---
  irParaGerenciarCapitulos(): void {
    if (!this.manga) return;

    this.router.navigate(
      ['/gerenciar-capitulo'],
      { queryParams: { id: this.manga.id } }
    );
  }
}
