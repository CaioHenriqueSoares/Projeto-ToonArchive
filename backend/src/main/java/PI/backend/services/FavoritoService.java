package PI.backend.services;

import PI.backend.models.Favorito;
import PI.backend.models.Manga;
import PI.backend.models.Usuario;
import PI.backend.repositories.FavoritoRepository;
import PI.backend.repositories.MangaRepository;
import PI.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FavoritoService {

    @Autowired
    private FavoritoRepository favoritoRepository;

    @Autowired
    private MangaRepository mangaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public boolean toggleFavorito(Long usuarioId, Long mangaId) {
        Optional<Favorito> existing = favoritoRepository.findByUsuarioIdAndMangaId(usuarioId, mangaId);
        if (existing.isPresent()) {
            favoritoRepository.delete(existing.get());
            return false;
        } else {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + usuarioId));
            Manga manga = mangaRepository.findById(mangaId)
                    .orElseThrow(() -> new IllegalArgumentException("Manga não encontrado: " + mangaId));

            Favorito f = new Favorito(usuario, manga);
            favoritoRepository.save(f);
            return true;
        }
    }

    public boolean isFavorito(Long usuarioId, Long mangaId) {
        return favoritoRepository.findByUsuarioIdAndMangaId(usuarioId, mangaId).isPresent();
    }

    public List<Manga> listarFavoritosDoUsuario(Long usuarioId) {
        return favoritoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(Favorito::getManga)
                .collect(Collectors.toList());
    }

    public long countFavoritos(Long mangaId) {
        return favoritoRepository.countByMangaId(mangaId);
    }

    public List<Manga> topFavoritos(int limit) {
        List<Object[]> rows = favoritoRepository.findMangaIdAndCountOrderByCountDesc(PageRequest.of(0, limit));
        List<Long> mangaIds = rows.stream().map(r -> ((Number) r[0]).longValue()).collect(Collectors.toList());
        if (mangaIds.isEmpty()) return Collections.emptyList();
        List<Manga> mangas = mangaRepository.findAllById(mangaIds);
        // Manter a ordem do mangaIds
        Map<Long, Manga> map = mangas.stream().collect(Collectors.toMap(Manga::getId, m -> m));
        List<Manga> ordered = mangaIds.stream().map(map::get).filter(Objects::nonNull).collect(Collectors.toList());
        return ordered;
    }
}
