import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule]
})
export class HomeComponent implements AfterViewInit, OnDestroy{
  @ViewChild('destaques') destaquesContainer!: ElementRef;
  @ViewChild('favoritos') favoritosContainer!: ElementRef;

  slideIndex = 0;
  autoSlide: any;
  pauseTimeout: any;

  slides = [
    { imagem: 'assets/BannerConstantine.png', titulo: 'Constantine', link: '/manga/constantine' },
    { imagem: 'assets/BannerGachakuta.png', titulo: 'Gachiakuta', link: '/manga/gachiakuta' },
    { imagem: 'assets/BannerBleach.png', titulo: 'Bleach', link: '/manga/bleach' },
    { imagem: 'assets/BannerDanDaDan.png', titulo: 'Dan Da Dan', link: '/manga/dandadan' },
  ];

  destaquesList = [
    { nome: 'Bleach', img: 'assets/CapaMangaBleach.png' },
    { nome: 'Kaguya-sama', img: 'assets/CapaMangaKaguya-sama.png' },
    { nome: 'Solo Leveling', img: 'assets/CapaMangaSoloLeveling.png' },
    { nome: 'Gachiakuta', img: 'assets/CapaMangaGachiakuta.png' },
    { nome: 'Constantine', img: 'assets/CapaHqConstantine.png' },
    { nome: 'ReiDeLata', img: 'assets/CapaMangaReidelata.jpg' },
    { nome: 'TartarugaNinjas', img: 'assets/CapaHqTartarugasNinja.png' },
    { nome: 'Gokurakugai', img: 'assets/CapaMangaGkkg.png' },
    { nome: 'Ben 10', img: 'assets/Bem 10.png' },
    { nome: 'Invencivel', img: 'assets/CapaHqInvencivel.png' }
  ];

  favoritosList = [
    { nome: 'Bleach', img: 'assets/CapaMangaBleach.png' },
    { nome: 'Solo Leveling', img: 'assets/CapaMangaSoloLeveling.png' },
    { nome: 'Kaguya-sama', img: 'assets/CapaMangaKaguya-sama.png' },
    { nome: 'Gachiakuta', img: 'assets/CapaMangaGachiakuta.png' },
    { nome: 'Motoqueiro Fantasma', img: 'assets/CapaHqMotoqueiroFantasma.png' },
    { nome: 'ReiDeLata', img: 'assets/CapaMangaReidelata.jpg' },
    { nome: 'Batman Absolute', img: 'assets/CapaHqBatmanAbsolute.png' },
    { nome: 'Invencível', img: 'assets/CapaHqInvencivel.png' },
    { nome: 'Jujutsu Kaisen', img: 'assets/CapaMangaJujutsuKaisen.png' },
    { nome: 'Chainsaw Man', img: 'assets/CapaMangaChainsawMan.png' }
  ];

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    clearInterval(this.autoSlide);
    clearTimeout(this.pauseTimeout);
  }

  // ===== Carrossel de banners =====
  startAutoSlide() {
    this.autoSlide = setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoSlide() {
    clearInterval(this.autoSlide);
  }

  nextSlide() {
    this.slideIndex = (this.slideIndex + 1) % this.slides.length;
  }

  goToSlide(index: number) {
    this.stopAutoSlide();
    this.slideIndex = index;
    clearTimeout(this.pauseTimeout);
    this.pauseTimeout = setTimeout(() => this.startAutoSlide(), 10000);
  }

   // ===== Menu lateral =====
  toggleMenu() {
  const menu = document.getElementById('menu-lateral');
  const overlay = document.getElementById('overlay');

  if (menu && overlay) {
    menu.classList.toggle('ativo');
    overlay.classList.toggle('ativo');
  } else {
    console.warn('Menu ou overlay não encontrados no DOM.');
  }
}

  // ===== Scroll das listas =====
  scrollDestaques(distancia: number) {
    this.destaquesContainer.nativeElement.scrollBy({ left: distancia, behavior: 'smooth' });
  }

  scrollFavoritos(distancia: number) {
    this.favoritosContainer.nativeElement.scrollBy({ left: distancia, behavior: 'smooth' });
  }

  // ===== Navegação Angular =====
  irPara(rota: string) {
    this.router.navigate([rota]);
  }
}
