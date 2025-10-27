import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manga-detalhe',
  standalone: true,
  templateUrl: './manga-detalhe.component.html',
  styleUrls: ['./manga-detalhe.component.css'],
  imports: [CommonModule, FormsModule]
})
export class MangaDetalheComponent {
  manga = {
    titulo: 'SPY×FAMILY',
    autor: 'Endou Tatsuya',
    imagem: 'assets/spyfamily.jpg',
    descricao: `O mestre espião de codinome Crepúsculo passou a maior parte da sua vida em missões secretas, tudo pelo sonho de um mundo melhor. 
                No entanto, um dia ele recebe uma ordem particularmente difícil do comando. 
                Para sua missão, ele deverá formar uma família temporária e começar uma nova vida!`,
    tags: ['Romance', 'Comédia', 'Ação', 'Shounen', '2019']
  };

  capitulos = [
    { titulo: 'Capítulo 120.5', subtitulo: 'Missão Curta: 120.5', data: 'Há 10 dias', comentarios: 14, visualizacoes: 449 }
  ];

  comentarios: string[] = [];
  novoComentario = '';

  iniciarLeitura() {
    alert('Leitura iniciada!');
  }

  favoritar() {
    alert('Mangá adicionado aos favoritos!');
  }

  avaliar() {
    alert('Função de avaliação em breve!');
  }

  enviarComentario() {
    if (this.novoComentario.trim() === '') return;
    this.comentarios.push(this.novoComentario);
    this.novoComentario = '';
  }
}
