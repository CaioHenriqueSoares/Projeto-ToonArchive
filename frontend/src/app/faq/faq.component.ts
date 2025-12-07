import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type FaqItem = {
  id: number;
  q: string;
  a: string;
  open?: boolean;
};

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  query = '';

  faqs: FaqItem[] = [
    {
      id: 1,
      q: 'O que é o ToonArchive?',
      a: `O ToonArchive é uma plataforma para leitura e publicação de mangás e HQs.
Autores podem criar e gerenciar suas obras, enquanto leitores podem explorar, comentar e acompanhar lançamentos.`
    },
    {
      id: 2,
      q: 'Como publicar uma obra no ToonArchive?',
      a: `Siga estes passos:
1) Acesse a área de publicação (menu → Publicar Obra).
2) Preencha o formulário com Nome da obra, Autor (preenchido automaticamente), Editora, Ano, Descrição e Capa.
3) Clique em "Publicar". Após criar a obra, acesse a página da obra → Gerenciar Capítulos → Adicionar Capítulo e preencha Título, Número e Páginas.`
    },
    {
      id: 3,
      q: 'Posso editar minha obra depois de publicar?',
      a: `Sim. Somente o AUTOR pode:
- Mudar título e páginas de capítulos existentes.
- Adicionar, editar e excluir capítulos.`
    },
    {
      id: 4,
      q: 'Outros usuários podem editar minha obra?',
      a: `Não. Somente o autor da obra ou um administrador pode editá-la.`
    },
    {
      id: 5,
      q: 'Como excluo uma obra?',
      a: `Abra a página da obra (de que você é autor) → clique em "Excluir obra" → confirme. Atenção: ação permanente.`
    },
    {
      id: 6,
      q: 'Há limite de obras que posso publicar?',
      a: `Não. Autores podem publicar quantas obras quiserem.`
    },
    {
      id: 7,
      q: 'Como faço para comentar uma obra?',
      a: `Abra a página da obra → vá até a seção Comentários → digite seu comentário → clique em "Enviar".`
    }
  ];

  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  // toggle item
  toggle(item: FaqItem) {
    item.open = !item.open;
  }

  // Helpers
  filteredFaqs(): FaqItem[] {
    const q = (this.query || '').toLowerCase().trim();
    if (!q) return this.faqs;
    return this.faqs.filter(f =>
      f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  expandAll() {
    this.faqs.forEach(f => (f.open = true));
  }
  collapseAll() {
    this.faqs.forEach(f => (f.open = false));
  }

  /**
   * Formata o texto da resposta: troca quebras de linha por <br/>
   * e devolve SafeHtml para usar com [innerHTML].
   */
  formatAnswer(answer: string): SafeHtml {
    const safeText = String(answer || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const html = safeText.replace(/\r\n|\r|\n/g, '<br/>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
