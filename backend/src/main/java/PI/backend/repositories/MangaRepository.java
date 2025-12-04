package PI.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import PI.backend.models.Manga;
import java.util.List;

public interface MangaRepository extends JpaRepository<Manga, Long> {

    List<Manga> findByNomeContainingIgnoreCase(String nome);

}
