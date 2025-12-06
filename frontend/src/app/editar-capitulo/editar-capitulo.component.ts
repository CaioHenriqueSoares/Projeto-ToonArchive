import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

type PageItem = {
  id: string;
  url: string;        // usada no <img> (objectURL para novas, absolute URL para existentes)
  ordem: number;      // 1-based
  isNew?: boolean;    // true se veio do input file
  file?: File;        // presente se isNew === true
  originalPath?: string; // caminho relativo vindo do backend (ex: /uploads/abc.png)
};

@Component({
  selector: 'app-editar-capitulo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './editar-capitulo.component.html',
  styleUrls: ['./editar-capitulo.component.css']
})
export class EditarCapituloComponent implements OnInit {
  API = 'http://localhost:8080';
  id!: string | null;
  mangaId: string | null = null; // <-- id do mangá (importante para validação)
  editForm!: FormGroup;

  // única lista unificada de páginas (existentes + novas)
  pages: PageItem[] = [];

  // drag state
  dragIndex: number | null = null;

  rawResposta: any = null;
  showDebug = false;
  backLinkHref = ''; // não usar javascript:...
  saving = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');
    this.editForm = this.fb.group({
      tituloCapitulo: [''],
      numero: ['']
    });
    if (!this.id) {
      console.warn('EditarCapitulo: id ausente na URL');
      return;
    }
    this.carregarCapitulo();
  }

  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  private montarUrlBackend(url: string): string {
    const limpa = String(url || '').trim();
    if (!limpa) return '';
    if (limpa.startsWith('http://') || limpa.startsWith('https://')) return limpa;
    const finalPath = limpa.startsWith('/') ? limpa : '/' + limpa;
    return this.API.replace(/\/$/, '') + finalPath;
  }

  async carregarCapitulo() {
    try {
      const res = await lastValueFrom(this.http.get<any>(`${this.API}/capitulos/${this.id}`));
      this.rawResposta = res;

      this.editForm.patchValue({
        tituloCapitulo: res.tituloCapitulo ?? res.titulo ?? '',
        numero: res.numero ?? ''
      });

      // guarda o mangaId corretamente para validações posteriores
      this.mangaId = res.manga?.id ?? res.mangaId ?? null;

      // reset pages
      this.pages = [];

      // se veio string delimitada por ';'
      if (res.paginas && typeof res.paginas === 'string') {
        const urls = String(res.paginas)
          .split(';')
          .map((p: string) => p.trim())
          .filter((p: string) => p !== '');

        this.pages = urls.map((u, idx) => ({
          id: this.gerarId(),
          url: this.montarUrlBackend(u),
          ordem: idx + 1,
          isNew: false,
          originalPath: u.startsWith('/') ? u : '/' + u // ajuda na hora de enviar
        }));
      } else if (Array.isArray(res.paginas)) {
        // caso backend envie array
        this.pages = res.paginas.map((p: any, idx: number) => {
          const raw = typeof p === 'string' ? p : (p.url ?? '');
          return {
            id: this.gerarId(),
            url: this.montarUrlBackend(raw),
            ordem: idx + 1,
            isNew: false,
            originalPath: raw.startsWith('/') ? raw : '/' + raw
          };
        });
      }

      // ajustar back link se houver manga
      if (res.manga && res.manga.id) {
        this.backLinkHref = '';
      }

    } catch (err) {
      console.error('Erro ao carregar capítulo', err);
    }
  }

  /* ----------------------------
     Manipulação de arquivos novos
     ---------------------------- */

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const arquivos = Array.from(input.files);
    arquivos.forEach(file => {
      const id = this.gerarId();
      const preview = URL.createObjectURL(file);
      const item: PageItem = {
        id,
        url: preview,
        ordem: this.pages.length + 1,
        isNew: true,
        file,
        originalPath: undefined
      };
      this.pages.push(item);
    });

    // limpa o input para permitir reselect
    input.value = '';
    this.reindex();
  }

  removePage(index: number) {
    if (index < 0 || index >= this.pages.length) return;
    const item = this.pages[index];
    // revoke objectURL se for novo
    if (item.isNew && item.url) {
      try { URL.revokeObjectURL(item.url); } catch (e) { }
    }
    this.pages.splice(index, 1);
    this.reindex();
  }

  /* ----------------------------
     Drag & Drop (unificado)
     ---------------------------- */

  onDragStart(index: number) {
    this.dragIndex = index;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(index: number) {
    if (this.dragIndex === null || this.dragIndex === index) { this.dragIndex = null; return; }
    const item = this.pages.splice(this.dragIndex, 1)[0];
    this.pages.splice(index, 0, item);
    this.dragIndex = null;
    this.reindex();
  }

  private reindex() {
    this.pages.forEach((p, i) => p.ordem = i + 1);
  }

  /* ----------------------------
     HELPERS: fetchar uma URL de imagem e transformar em File
     ---------------------------- */

  private async fetchUrlAsFile(url: string, filenameHint?: string): Promise<File> {
    // usa fetch para obter o blob; requer que o servidor permita CORS para as imagens
    const res = await fetch(url, { method: 'GET', credentials: 'same-origin' } as any);
    if (!res.ok) throw new Error(`Falha ao buscar imagem ${url}: ${res.status}`);
    const blob = await res.blob();
    // tenta inferir extensão a partir do tipo
    const extFromType = blob.type ? blob.type.split('/').pop() : '';
    const ext = filenameHint?.split('.').pop() || extFromType || 'bin';
    const name = filenameHint || (`img_${this.gerarId()}.${ext}`);
    return new File([blob], name, { type: blob.type || 'application/octet-stream' });
  }

  /* ----------------------------
     Submissão: envia todas as páginas COMO ARQUIVOS (na ordem) -> comportamento igual a publicar
     ---------------------------- */

  async onSubmit() {
    if (!this.id) return;

    // valida número duplicado: usa mangaId correto e ignora o próprio capítulo
    const numeroNovo = this.editForm.value.numero?.toString().trim();
    try {
      if (this.mangaId) {
        const lista = await lastValueFrom(this.http.get<any[]>(`${this.API}/capitulos/manga/${this.mangaId}`));
        const idAtual = String(this.id);
        const jaExiste = Array.isArray(lista) &&
          lista.some(c => String(c.numero) === numeroNovo && String(c.id) !== idAtual);
        if (jaExiste) {
          alert('❌ Já existe um capítulo com este número neste mangá! Use outro (ex: 5.5).');
          return;
        }
      } else {
        // se não tivermos mangaId, apenas logamos e permitimos continuar (evita bloquear edição inútilmente)
        console.warn('mangaId não disponível — pulando validação de número de capítulo.');
      }
    } catch (err) {
      console.error('Erro ao validar número:', err);
      // continua mesmo se a validação falhar por rede
    }

    const formData = new FormData();
    formData.append('tituloCapitulo', this.editForm.value.tituloCapitulo ?? '');
    formData.append('numero', this.editForm.value.numero ?? '');

    // percorrer pages NA ORDEM e anexar arquivos (existentes -> fetch -> File; novos -> p.file)
    for (let i = 0; i < this.pages.length; i++) {
      const p = this.pages[i];
      if (p.isNew) {
        if (p.file) {
          formData.append('paginas', p.file, p.file.name);
        } else {
          console.warn('Página isNew sem file no index', i, p);
        }
      } else {
        try {
          const hintName = p.originalPath ? (p.originalPath.split('/').pop() || undefined) : undefined;
          const fileFromUrl = await this.fetchUrlAsFile(p.url, hintName);
          formData.append('paginas', fileFromUrl, fileFromUrl.name);
        } catch (fetchErr) {
          console.error('Não foi possível fetchar a imagem existente. A submissão pode falhar se o backend depender dos arquivos:', p.url, fetchErr);
          alert('Não foi possível ler uma imagem existente (CORS/erro). Verifique se o servidor permite acesso ou me diga para usar outro método.');
          return;
        }
      }
    }

    // DEBUG: listar keys no console
    try {
      console.log('--- FormData preview ---');
      for (const e of Array.from((formData as any).entries())) {
        const [k, v] = e as [string, any];
        if (v instanceof File) console.log(k, '-> File', v.name, v.size, v.type);
        else console.log(k, '->', v);
      }
      console.log('------------------------');
    } catch (e) {
      // ignore
    }

    try {
      this.saving = true;
      const resp = await lastValueFrom(this.http.put(`${this.API}/capitulos/${this.id}`, formData, { observe: 'response' }));
      if (resp.status >= 200 && resp.status < 300) {
        alert('✅ Capítulo atualizado com sucesso!');
        this.voltar();
        return;
      } else {
        alert('❌ Erro ao atualizar capítulo.');
      }
    } catch (err: any) {
      console.error('Erro ao enviar atualização:', err);

      const status = err?.status ?? 0;
      if (status === 405 || status === 415 || status === 0) {
        console.warn('PUT multipart falhou — tentando fallback POST com X-HTTP-Method-Override: PUT');
        try {
          const headers = { 'X-HTTP-Method-Override': 'PUT' };
          const resp2 = await lastValueFrom(this.http.post(`${this.API}/capitulos/${this.id}`, formData, { headers: headers as any, observe: 'response' }));
          if (resp2.status >= 200 && resp2.status < 300) {
            alert('✅ Capítulo atualizado (fallback POST) com sucesso!');
            this.voltar();
            return;
          } else {
            console.error('Fallback POST retornou status:', resp2.status);
          }
        } catch (err2) {
          console.error('Fallback POST também falhou:', err2);
        }
      }

      alert('❌ Erro ao atualizar capítulo. Veja o console para detalhes.');
    } finally {
      this.saving = false;
    }
  }

  voltar() {
    // usa rota se souber mangaId no carregado; caso contrário apenas history.back()
    const mangaId = (this.rawResposta?.manga?.id) ?? (this.rawResposta?.mangaId ?? null);
    if (mangaId) {
      this.router.navigate(['/manga-detalhe'], { queryParams: { id: mangaId } });
    } else {
      window.history.back();
    }
  }
}
