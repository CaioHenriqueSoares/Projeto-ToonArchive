import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { PublicarObraComponent } from './publicar-obra/publicar-obra.component';
import { MangaDetalheComponent } from './manga-detalhe/manga-detalhe.component';
import { PublicarCapituloComponent } from './publicar-capitulo/publicar-capitulo.component';
import { CapituloDetalheComponent } from './capitulo-detalhe/capitulo-detalhe.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'publicar-obra', component: PublicarObraComponent },
  { path: 'home', component: HomeComponent },
  { path: 'manga-detalhe', component: MangaDetalheComponent },
  { path: 'publicar-capitulo', component: PublicarCapituloComponent },
  { path: 'capitulo-detalhe', component: CapituloDetalheComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
