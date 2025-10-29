package PI.backend.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import PI.backend.models.Capitulo;

@Repository
public interface CapituloRepository extends JpaRepository<Capitulo, Long> {
    List<Capitulo> findByMangaId(Long mangaId);

      boolean existsByMangaIdAndNumero(Long mangaId, Double numero);
}
