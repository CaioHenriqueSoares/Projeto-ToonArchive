import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-publicar-capitulo',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './publicar-capitulo.component.html',
  styleUrls: ['./publicar-capitulo.component.css']
})
export class PublicarCapituloComponent {

  API = 'http://localhost:8080';
  public mangaId: string | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  imagens: { id: string; file: File; preview: string }[] = [];
  dragIndex: number | null = null;
  imagemSelecionada: string | null = null;

  // campos do formulário (ligados com ngModel no template)
  tituloCapitulo = '';
  numero: number | null = null;

  // estado UI
  public mensagem = '';
  public mensagemTipo: 'ok' | 'warn' | 'err' | '' = '';

  // zoom / pan (mesmo do seu arquivo)
  zoomLevel = 1;
  offsetX = 0;
  offsetY = 0;
  isDragging = false;
  startX = 0;
  startY = 0;

  // CORREÇÃO aqui: concatena corretamente
  onSelecionarPaginas(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const arquivos = Array.from(input.files);
    const novasImagens = arquivos.map((file) => ({
      id: Date.now().toString() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));

    this.imagens = [...this.imagens, ...novasImagens]; // <<< fix
    input.value = ''; // limpa para permitir novo upload
  }

  onDragStart(index: number) {
    this.dragIndex = index;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(index: number) {
    if (this.dragIndex === null || this.dragIndex === index) return;
    const item = this.imagens.splice(this.dragIndex, 1)[0];
    this.imagens.splice(index, 0, item);
    this.dragIndex = null;
  }

  removerImagem(index: number) {
    this.imagens.splice(index, 1);
  }

  abrirPreview(preview: string) {
    this.imagemSelecionada = preview;
  }

  fecharPreview() {
    this.imagemSelecionada = null;
  }

  // ZOOM / PAN
  onWheel(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY < 0) this.zoomIn();
    else this.zoomOut();
  }
  zoomIn() { this.zoomLevel = Math.min(this.zoomLevel + 0.2, 3); }
  zoomOut() { this.zoomLevel = Math.max(this.zoomLevel - 0.2, 0.5); }
  resetZoom() { this.zoomLevel = 1; this.offsetX = 0; this.offsetY = 0; }
  onMouseDown(event: MouseEvent) {
    if (this.zoomLevel <= 1) return;
    this.isDragging = true;
    this.startX = event.clientX - this.offsetX;
    this.startY = event.clientY - this.offsetY;
  }
  onMouseUp() { this.isDragging = false; }
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    this.offsetX = event.clientX - this.startX;
    this.offsetY = event.clientY - this.startY;
  }

  // --- Envio para o backend (substitui a lógica fetch do HTML original) ---
  async publicarCapitulo() {
    // impede tentativa sem imagens
    if (this.imagens.length === 0) {
      this.showMessage('⚠️ Adicione ao menos uma página.', 'warn');
      return;
    }

    // tenta obter mangaId via query param (similar ao HTML original)
    const mangaId = this.route.snapshot.queryParamMap.get('id');
    if (!mangaId) {
      this.showMessage('❌ ID do mangá não encontrado na URL!', 'err');
      return;
    }

    const formData = new FormData();
    formData.append('mangaId', mangaId);
    formData.append('tituloCapitulo', this.tituloCapitulo || '');
    formData.append('numero', (this.numero ?? '').toString());

    this.imagens.forEach(img => formData.append('paginas', img.file));

    this.showMessage('Publicando...', ''); // status temporário
    try {
      const resposta = await this.http.post('http://localhost:8080/capitulos', formData, { observe: 'response', responseType: 'text' as 'json' }).toPromise();

      // se o backend retornar 201/200 -> sucesso
      if ((resposta as any)?.status === 409) {
        this.showMessage('⚠️ Já existe um capítulo com esse número neste mangá.', 'warn');
      } else {
        this.showMessage('✅ Capítulo publicado com sucesso!', 'ok');
        // opcional: limpar formulário
        this.tituloCapitulo = '';
        this.numero = null;
        this.imagens = [];
      }
    } catch (err) {
      const httpErr = err as HttpErrorResponse;
      if (httpErr.status === 409) {
        this.showMessage('⚠️ Já existe um capítulo com esse número neste mangá.', 'warn');
      } else if (!navigator.onLine) {
        this.showMessage('❌ Erro de conexão com o servidor.', 'err');
      } else {
        const texto = (httpErr.error && typeof httpErr.error === 'string') ? httpErr.error : '';
        this.showMessage('❌ Erro ao publicar capítulo. ' + texto, 'err');
      }
    }
  }

  ngOnInit(): void {
    this.mangaId = this.route.snapshot.queryParamMap.get('id');
  }

  voltarManga() {
  if (this.mangaId) {
      // Assume-se que a tela de detalhes do mangá usa 'id' como query param
      this.router.navigate(['/manga-detalhe'], { queryParams: { id: this.mangaId } }); 
    } else {
      // Se não houver ID (erro), volta para a home
      this.router.navigate(['/home']);
    }
}

  showMessage(text: string, type: 'ok'|'warn'|'err'|'') {
    this.mensagem = text;
    this.mensagemTipo = type;
    // você pode adicionar timeout para esconder depois de X segundos se quiser
  }
}
