import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css'],
  imports: [CommonModule, FormsModule]
})
export class CadastroComponent {
  usuario = {
    apelido: '',
    email: '',
    senha: '',
    confirmar: ''
  };

  mensagemErro = '';

  constructor(private router: Router) {}

  criarConta() {
    if (!this.usuario.apelido || !this.usuario.email || !this.usuario.senha || !this.usuario.confirmar) {
      this.mensagemErro = 'Por favor, preencha todos os campos.';
      return;
    }

    if (this.usuario.senha !== this.usuario.confirmar) {
      this.mensagemErro = 'As senhas não coincidem.';
      return;
    }

    // Aqui no futuro você pode integrar com o backend (API)
    console.log('Novo usuário:', this.usuario);
    alert('Conta criada com sucesso!');
    this.router.navigate(['/']);
  }
}
