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

  this.http.post<LoginResponse>('http://localhost:8080/usuarios/login', payload)
    .subscribe({
      next: (res) => {
        if (res && res.status === 'OK') {
          this.afterSuccessfulLogin(res, payload.apelido);
        } else {
          // se usuário não autenticou, tentamos admin (fallback)
          this.tryAdminLogin(payload);
        }
      },
      error: (err) => {
        // se foi 401 ou outro erro de autenticação, tentamos admin
        if (err && err.status === 401) {
          this.tryAdminLogin(payload);
        } else {
          // em outros erros (servidor inativo), mostrar mensagem
          console.error('Erro no login /usuarios:', err);
          // tentar admin também caso seja apenas endpoint ausente
          this.tryAdminLogin(payload);
        }
      },
      complete: () => this.loading = false
    });
}

private tryAdminLogin(payload: { apelido: string, senha: string }) {
  this.loading = true;
  this.http.post<LoginResponse>('http://localhost:8080/admin/login', payload)
    .subscribe({
      next: (res) => {
        if (res && res.status === 'OK') {
          // marca tipo admin explicitamente caso backend não retorne 'tipo'
          res.tipo = res.tipo ?? 'admin';
          this.afterSuccessfulLogin(res, payload.apelido);
        } else {
          this.message = res?.mensagem || 'Usuário ou senha incorretos!';
          this.messageColor = 'red';
        }
      },
      error: (err) => {
        console.error('Erro no login admin:', err);
        // extrai mensagem se o backend retornou
        const msg = err?.error?.mensagem || 'Usuário ou senha incorretos!';
        this.message = msg;
        this.messageColor = 'red';
      },
      complete: () => this.loading = false
    });
}

private afterSuccessfulLogin(res: LoginResponse, fallbackApelido: string) {
  this.message = 'Login realizado com sucesso!';
  this.messageColor = 'lightgreen';

  const apelidoReal = res.apelido ?? fallbackApelido;
  localStorage.setItem('apelido', apelidoReal);

  const tipo = res.tipo ?? (res.usuario?.tipo) ?? 'usuario';
  localStorage.setItem('tipo', tipo);

  const maybeId = (res as any).id ?? (res as any).usuario?.id ?? (res as any).usuarioId ?? null;
  if (maybeId && !isNaN(Number(maybeId)) && Number(maybeId) > 0) {
    localStorage.setItem('usuarioId', String(maybeId));
  } else {
    console.warn('Login OK mas user id não retornado pelo backend.');
  }

  setTimeout(() => this.router.navigate(['/home']), 500);
}

}
