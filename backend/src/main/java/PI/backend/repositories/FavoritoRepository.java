package PI.backend.repositories;

import PI.backend.models.Favorito;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FavoritoRepository extends JpaRepository<Favorito, Long> {

    Optional<Favorito> findByUsuarioIdAndMangaId(Long usuarioId, Long mangaId);

    List<Favorito> findByUsuarioId(Long usuarioId);

    long countByMangaId(Long mangaId);

    // Retorna pares [mangaId, count]
    @Query("SELECT f.manga.id, COUNT(f) as cnt FROM Favorito f GROUP BY f.manga.id ORDER BY cnt DESC")
    List<Object[]> findMangaIdAndCountOrderByCountDesc(Pageable pageable);
}
