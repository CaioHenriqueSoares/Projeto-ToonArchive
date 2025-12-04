import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  message = '';
  messageColor = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.form = this.fb.group(
      {
        apelido: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        senha: ['', [Validators.required, Validators.minLength(6)]],
        confirm: ['', [Validators.required]],
      },
      { validators: this.passwordsMatch }
    );
  }

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const senha = group.get('senha')?.value;
    const confirm = group.get('confirm')?.value;
    return senha === confirm ? null : { passwordMismatch: true };
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

    const { apelido, email, senha } = this.form.getRawValue();
    const payload = { apelido, email, senha };

    this.loading = true;

    this.http.post('http://localhost:8080/usuarios', payload).subscribe({
      next: () => {
        this.message = 'Conta criada com sucesso! Redirecionando...';
        this.messageColor = 'lightgreen';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: () => {
        this.message = 'Erro ao cadastrar usuário.';
        this.messageColor = 'red';
      },
      complete: () => (this.loading = false),
    });
  }
}
