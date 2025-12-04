import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { PublicarObraComponent } from './publicar-obra/publicar-obra.component';
import { MangaDetalheComponent } from './manga-detalhe/manga-detalhe.component';
import { CapituloDetalheComponent } from './capitulo-detalhe/capitulo-detalhe.component';

@NgModule({
  
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AppComponent,
    HomeComponent,
    LoginComponent,
    CadastroComponent,
    PublicarObraComponent,
    MangaDetalheComponent,
    CapituloDetalheComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
