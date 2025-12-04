import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publicar-obra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicar-obra.component.html',
  styleUrls: ['./publicar-obra.component.css']
})
export class PublicarObraComponent {

  //Router para redirecionar ao home após a publicação da obra
  constructor(private router: Router) {}

  // Arquivos e capa enviados
  capaFile: File | null = null;
  arquivosSelecionados: File[] = [];

  // Objeto que o HTML espera
  manga = {
    nome: '',
    autor: '',
    editora: '',
    ano: '',
    descricao: ''
  };

  onCapaSelecionada(event: any): void {
  const file: File = event.target.files[0];
  this.capaFile = file || null;
}

  // ============================
  // SELECIONAR ARQUIVOS
  // ============================
  selecionarArquivos(event: any): void {
    const arquivos = Array.from(event.target.files);
    this.arquivosSelecionados = arquivos as File[];
  }

  // ============================
  // ENVIAR AO BACKEND
  // ============================
  async publicarManga(): Promise<void> {
    const formData = new FormData();

    formData.append("nome", this.manga.nome);
    formData.append("autor", this.manga.autor);
    formData.append("editora", this.manga.editora);
    formData.append("ano", this.manga.ano);
    formData.append("descricao", this.manga.descricao);

    if (this.capaFile) {
    formData.append('capa', this.capaFile);
  }

    this.arquivosSelecionados.forEach(arquivo => {
      formData.append("capitulos", arquivo);
    });

    try {
      const resposta = await fetch("http://localhost:8080/mangas", {
        method: "POST",
        body: formData
      });

      if (resposta.ok) {
        alert("Mangá publicado com sucesso!");
        this.router.navigate(['/home']);
      } else {
        alert("Erro ao publicar o mangá!");
      }
    } catch (erro) {
      alert("Erro ao conectar ao servidor!");
      console.error(erro);
    }
  }

}