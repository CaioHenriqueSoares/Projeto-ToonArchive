import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manga-detalhe',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
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
    } else {
      // Opcional: Redirecionar para uma página de erro ou home
      console.error("ID do mangá não encontrado na URL.");
      // this.router.navigate(['/home']); 
    }
  });
  }

  // --- carregamento de dados ---
  carregarManga(id: string) {
  // Opcional, mas limpa o estado anterior
  this.manga = null; 
  this.http.get<any>(`${this.API}/mangas/${id}`)
    .subscribe({
      next: (m) => {
        this.manga = m; 
        this.capitulos = m.capitulos || []; 
        this.isAuthor = this.manga.autor === this.usuarioAtual;
        this.atualizarPermissoesPorManga();
      },
      error: (err) => {
        console.error('Erro ao carregar mangá:', err);
        
        // CORREÇÃO CRÍTICA: Define 'manga' para um objeto de erro.
        // Isso faz com que o *ngIf="manga" seja TRUE, saindo do carregamento.
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


  private atualizarPermissoesPorManga(): void {
    console.log('[DEBUG] atualizarPermissoesPorManga - usuarioAtual (localStorage.apelido):', this.usuarioAtual);
    console.log('[DEBUG] manga recebido:', this.manga);

    if (!this.manga) {
      this.isAuthor = false;
      return;
    }

    // tenta extrair apelido/username/identificador do autor em várias formas
    let autorDoManga = '';

    // caso 1: autor é string (ex: "joao")
    if (typeof this.manga.autor === 'string' && this.manga.autor.trim() !== '') {
      autorDoManga = this.manga.autor;
    }

    // caso 2: autor é objeto com apelido/username/nome
    else if (typeof this.manga.autor === 'object' && this.manga.autor !== null) {
      autorDoManga = (
        this.manga.autor.apelido ||
        this.manga.autor.username ||
        this.manga.autor.nome ||
        ''
      ).toString();
    }

    // caso 3: autor pode ser um id numérico (ex: 5) -> tenta comparar por id se você tiver userId local
    // daqui em diante, normalizamos strings
    const autorNormalized = (autorDoManga || '').toString().trim();
    const usuarioNormalized = (this.usuarioAtual || '').toString().trim();

    // regra principal: author se apelido bater com usuarioAtual (case-insensitive)
    if (autorNormalized && usuarioNormalized) {
      this.isAuthor = usuarioNormalized.toLowerCase() === autorNormalized.toLowerCase();
    } else {
      // fallback: se backend retorna autor como objeto com id e você tem userId no localStorage
      const autorId = this.manga.autor?.id ?? this.manga.autor?.userId ?? null;
      const userIdLocal = localStorage.getItem('userId') || localStorage.getItem('usuarioId') || null;
      if (autorId && userIdLocal) {
        this.isAuthor = String(autorId) === String(userIdLocal);
      } else {
        this.isAuthor = false;
      }
    }
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

  // --- navegação ---
  irParaGerenciarCapitulos(): void {
    if (!this.manga) return;

    this.router.navigate(
      ['/publicar-capitulo'],
      { queryParams: { id: this.manga.id } }
    );
  }
}
