import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface LoginResponse {
  status: string;
  mensagem?: string;
  apelido?: string;
  id?: number;           // esperamos o id do usuário aqui
  tipo?: string;         // opcional: tipo/role
  // caso o backend retorne um objeto usuário: usuario?: { id: number, apelido: string, ... }
  usuario?: any;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  message = '';
  messageColor = '';

  private readonly apiUrl = 'http://localhost:8080/usuarios/login';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.form = this.fb.group({
      apelido: ['', [Validators.required]],   // aceita e-mail OU apelido
      senha: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.message = '';
    this.messageColor = '';

    if (this.form.invalid) {
      this.message = 'Preencha os campos corretamente.';
      this.messageColor = 'red';
      return;
    }

    const { apelido, senha } = this.form.getRawValue();
    const payload = { apelido, senha };

    this.loading = true;

    this.http.post<LoginResponse>(this.apiUrl, payload)
      .subscribe({
        next: (res) => {
          if (res && res.status === 'OK') {
            this.message = 'Login realizado com sucesso!';
            this.messageColor = 'lightgreen';

            const apelidoReal = res.apelido ?? payload.apelido;
            localStorage.setItem('apelido', apelidoReal);

            const tipo = res.tipo ?? (res.usuario?.tipo) ?? 'usuario';
            localStorage.setItem('tipo', tipo);

            const maybeId = (res as any).id ?? (res as any).usuario?.id ?? (res as any).usuarioId ?? null;
            if (maybeId && !isNaN(Number(maybeId)) && Number(maybeId) > 0) {
              localStorage.setItem('usuarioId', String(maybeId));
            } else {
              console.warn('Login OK mas user id não retornado pelo backend. Para funcionalidades de favoritos, o backend deve retornar o id do usuário no login.');
            }

            setTimeout(() => this.router.navigate(['/home']), 800);
          } else {
            this.message = res?.mensagem || 'Usuário ou senha incorretos!';
            this.messageColor = 'red';
          }
        },
        error: (err) => {
          console.error('Erro no login:', err);
          this.message = 'Erro ao conectar ao servidor!';
          this.messageColor = 'red';
        },
        complete: () => (this.loading = false)
      });
  }
}
