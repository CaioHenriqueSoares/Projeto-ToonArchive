import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gerenciar-capitulo',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './gerenciar-capitulo.component.html',
  styleUrls: ['./gerenciar-capitulo.component.css']
})
export class GerenciarCapituloComponent implements OnInit {

  API = 'http://localhost:8080';
  mangaId!: number;

  capitulos: any[] = [];
  carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.mangaId = Number(this.route.snapshot.queryParamMap.get('id'));
    this.carregarCapitulos();
  }

  carregarCapitulos() {
    this.carregando = true;

    this.http.get<any[]>(`${this.API}/capitulos/manga/${this.mangaId}`).subscribe({
      next: (lista) => {
        this.capitulos = lista.sort((a, b) => a.numero - b.numero);
        this.carregando = false;
      },
      error: (err) => {
        console.error("Erro ao carregar capítulos", err);
        this.carregando = false;
      }
    });
  }

  deletarCapitulo(id: number, titulo: string) {
    const confirmacao = confirm(`Tem certeza que deseja excluir o capítulo "${titulo}"?`);
    if (!confirmacao) return;

    this.http.delete(`${this.API}/capitulos/${id}`).subscribe({
      next: () => {
        alert("Capítulo excluído com sucesso!");
        this.carregarCapitulos();
      },
      error: () => alert("Não foi possível excluir o capítulo.")
    });
  }

  editarCapitulo(id: number) {
    this.router.navigate(['/editar-capitulo'], { queryParams: { id } });
  }

  adicionarCapitulo() {
    this.router.navigate(['/publicar-capitulo'], { queryParams: { id: this.mangaId } });
  }

  voltar() {
    this.router.navigate(['/manga-detalhe'], { queryParams: { id: this.mangaId } });
  }

}
