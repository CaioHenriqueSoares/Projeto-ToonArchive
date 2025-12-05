import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {

  private KEY = "favoritos";

  private getLista(): number[] {
    return JSON.parse(localStorage.getItem(this.KEY) || '[]');
  }

  private salvar(lista: number[]) {
    localStorage.setItem(this.KEY, JSON.stringify(lista));
  }

  // Verifica se um mangá é favorito
  isFavorito(id: number): boolean {
    return this.getLista().includes(id);
  }

  // Adiciona ou remove
  toggleFavorito(id: number): boolean {
    const lista = this.getLista();

    if (lista.includes(id)) {
      const nova = lista.filter(x => x !== id);
      this.salvar(nova);
      return false; // removido
    } else {
      lista.push(id);
      this.salvar(lista);
      return true; // adicionado
    }
  }

  // Lista todos os IDs dos favoritos
  getFavoritos(): number[] {
    return this.getLista();
  }
}
