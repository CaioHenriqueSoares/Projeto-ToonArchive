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
    const payload = { apelido, senha }; // compatível com seu backend atual

    this.loading = true;

     this.http.post<LoginResponse>(this.apiUrl, payload)
      .subscribe({
        next: (res) => {
          if (res.status === 'OK' && res.apelido) {
            this.message = 'Login realizado com sucesso!';
            this.messageColor = 'lightgreen';

            // salva o apelido REAL vindo do backend
            localStorage.setItem('apelido', res.apelido);
            localStorage.setItem('tipo', 'usuario');

            setTimeout(() => this.router.navigate(['/home']), 800);
          } else {
            this.message = res.mensagem || 'Usuário ou senha incorretos!';
            this.messageColor = 'red';
          }
        },
        error: () => {
          this.message = 'Erro ao conectar ao servidor!';
          this.messageColor = 'red';
        },
        complete: () => (this.loading = false)
      });
  }
}
