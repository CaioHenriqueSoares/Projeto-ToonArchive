import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publicar',
  standalone: true,
  templateUrl: './publicar.component.html',
  styleUrls: ['./publicar.component.css'],
  imports: [CommonModule, FormsModule]
})
export class PublicarComponent {
  manga = {
    nome: '',
    autor: '',
    editora: '',
    ano: '',
    descricao: ''
  };

  arquivosSelecionados: File[] = [];

  constructor(private router: Router) {}

  selecionarArquivos(event: any) {
    this.arquivosSelecionados = Array.from(event.target.files);
  }

  publicarManga() {
    if (!this.manga.nome || !this.manga.autor || !this.manga.descricao) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    console.log('Mangá publicado:', this.manga);
    console.log('Arquivos enviados:', this.arquivosSelecionados);

    alert(`Mangá "${this.manga.nome}" publicado com sucesso!`);
    this.router.navigate(['/']); // redireciona pra página inicial
  }
}
