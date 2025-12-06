import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Interfaces para os dados
interface Pagina {
  url: string;
  ordem: number;
}

interface Comentario {
  id: number;
  autor: string;
  texto: string;
  dataHora: string;
  capitulo: { id: number };
  emEdicao: boolean;
  antigoTexto: string;
  confirmandoExclusao: boolean;
}

@Component({
  selector: 'app-capitulo',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './capitulo-detalhe.component.html',
  styleUrls: ['./capitulo-detalhe.component.css']
})
export class CapituloDetalheComponent implements OnInit {

  API = 'http://localhost:8080';

  // Propriedades de Dados
  capituloId: string | null = null;
  capitulo: any = null;
  paginas: Pagina[] = [];
  comentarios: any[] = [];
  paginaAtualIndex: number = 0;
  paginaAtual: Pagina | null = null;

  // Propriedades de UI e Formulário
  comentarioTexto: string = '';
  usuarioAtual: string = '';
  isAdmin: boolean = false;

  // Variáveis de estado
  isLoading: boolean = true;
  comentariosCarregados: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // 1. Configurar usuário e permissões
    this.usuarioAtual = (localStorage.getItem('apelido') || '').trim();
    this.isAdmin = localStorage.getItem('tipo') === 'admin';

    // 2. Subscrição para ler o ID e carregar dados (Recarrega se o ID mudar)
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.capituloId = id;
        this.isLoading = true; // Ativa o carregamento
        this.capitulo = null; // Limpa dados anteriores

        this.carregarCapitulo(id);
        this.carregarComentarios(id);
      } else {
        this.isLoading = false;
        // Se não houver ID, redireciona para a home
        this.router.navigate(['/home']);
      }
    });
  }

  // === MÉTODOS DE CARREGAMENTO DE DADOS ===

  carregarCapitulo(id: string): void {
    this.http.get<any>(`${this.API}/capitulos/${id}`).subscribe({
      next: (c) => {
        console.log('capitulo RAW do backend:', c);
        this.capitulo = c;
        this.isLoading = false;

        const rawPaginas = c.paginas;
        let paginasProcessadas: any[] = [];

        if (typeof rawPaginas === 'string' && rawPaginas.trim()) {

          paginasProcessadas = rawPaginas
            .split(';')
            .filter(url => url.trim().length > 0)
            .map((url, index) => {
              const urlLimpa = url.trim();

              return {
                url: this.API + urlLimpa,
                ordem: index + 1
              };
            });

        } else if (Array.isArray(c.paginas)) {
          paginasProcessadas = c.paginas;
        }

        if (paginasProcessadas.length > 0) {
          this.paginas = paginasProcessadas.sort((a: any, b: any) => a.ordem - b.ordem);
        } else {
          this.paginas = [];
        }

        console.log('Páginas processadas (Array correto):', this.paginas);

        if (this.paginas.length > 0) {
          this.setPaginaAtual(0);
        }
        const mangaId = c.mangaId ?? c.manga?.id ?? null;
        if (mangaId) {
          this.carregarCapitulosDoManga(mangaId, c);
        } else {
          console.warn('Não foi encontrado mangaId no payload do capítulo; não será possível calcular prev/next automaticamente.');
        }

      },
      error: (err) => {
        console.error('Erro ao carregar capítulo:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Tenta buscar lista de capítulos do mangá em endpoints comuns.
   * Ajuste os endpoints se sua API for diferente.
   */
  private carregarCapitulosDoManga(mangaId: number | string, capAtual: any): void {
    const url1 = `${this.API}/mangas/${mangaId}/capitulos`;
    const url2 = `${this.API}/capitulos?mangaId=${mangaId}`;

    this.http.get<any[]>(url1).subscribe({
      next: (lista) => this.processarListaCapitulos(lista, capAtual),
      error: (err1) => {
        // se falhar no primeiro, tenta o segundo
        this.http.get<any[]>(url2).subscribe({
          next: (lista2) => this.processarListaCapitulos(lista2, capAtual),
          error: (err2) => {
            console.error('Não foi possível obter lista de capítulos em nenhum endpoint.', err1, err2);
          }
        });
      }
    });
  }

  private processarListaCapitulos(lista: any[], capAtual: any): void {
    if (!Array.isArray(lista) || lista.length === 0) {
      console.warn('Lista de capítulos vazia ou inválida:', lista);
      return;
    }

    // Normaliza e ordena por número (se existir), fallback por id
    const ordenados = lista
      .map(ch => ({ ...ch, numero: Number(ch.numero ?? ch.num ?? ch.ordem ?? 0), id: ch.id }))
      .sort((a, b) => a.numero - b.numero);

    // Tenta encontrar pelo id primeiro, se não encontrar usa número
    let idx = ordenados.findIndex(x => String(x.id) === String(capAtual.id));
    if (idx === -1 && capAtual.numero != null) {
      idx = ordenados.findIndex(x => Number(x.numero) === Number(capAtual.numero));
    }

    if (idx === -1) {
      // Se ainda não encontrou, tenta achar por título/alguma correspondência simples
      idx = ordenados.findIndex(x => String(x.tituloCapitulo || '').trim() === String(capAtual.tituloCapitulo || '').trim());
    }

    if (idx === -1) {
      console.warn('Não foi possível localizar o capítulo atual na lista do mangá.', { capAtual, ordenados });
      return;
    }

    const prev = ordenados[idx - 1] ?? null;
    const next = ordenados[idx + 1] ?? null;

    // Atribui dinamicamente os ids esperados pelo template/metodos de navegação
    this.capitulo = this.capitulo ?? {};
    this.capitulo.capituloAnteriorId = prev ? prev.id : null;
    this.capitulo.proximoCapituloId = next ? next.id : null;

    console.log('capítulo anterior encontrado:', prev);
    console.log('próximo capítulo encontrado:', next);
  }

  setPaginaAtual(index: number): void {
    if (index >= 0 && index < this.paginas.length) {
      this.paginaAtualIndex = index;
      this.paginaAtual = this.paginas[index];
    }
  }

  // Navega para a próxima página do capítulo
  proximaPagina(): void {
    if (this.paginaAtualIndex < this.paginas.length - 1) {
      this.setPaginaAtual(this.paginaAtualIndex + 1);
    } else {
      // Quando chega ao final do capítulo, verifica se há um próximo capítulo
      this.proximoCapitulo();
    }
  }

  // Navega para a página anterior do capítulo
  paginaAnterior(): void {
    if (this.paginaAtualIndex > 0) {
      this.setPaginaAtual(this.paginaAtualIndex - 1);
    } else {
      // Quando chega ao início do capítulo, verifica se há um capítulo anterior
      this.capituloAnterior();
    }
  }

  // MÉTODOS DE NAVEGAÇÃO ENTRE CAPÍTULOS (já devem existir)
  proximoCapitulo(): void {
    const id = this.capitulo?.proximoCapituloId;
    if (id) {
      this.router.navigate(['/capitulo-detalhe'], { queryParams: { id } });
    } else {
      console.warn('Sem próximo capítulo (id):', this.capitulo);
    }
  }

  capituloAnterior(): void {
    const id = this.capitulo?.capituloAnteriorId;
    if (id) {
      this.router.navigate(['/capitulo-detalhe'], { queryParams: { id } });
    } else {
      console.warn('Sem capítulo anterior (id):', this.capitulo);
    }
  }

  // === MÉTODOS DE COMENTÁRIOS ===
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

  // === NAVEGAÇÃO ===

  voltarManga(): void {
    if (this.capitulo && this.capitulo.manga && this.capitulo.manga.id) {
      const mangaId = this.capitulo.manga.id;
      this.router.navigate(['/manga-detalhe'], { queryParams: { id: mangaId } });
    } else {
      this.router.navigate(['/home']);
    }
  }
}
