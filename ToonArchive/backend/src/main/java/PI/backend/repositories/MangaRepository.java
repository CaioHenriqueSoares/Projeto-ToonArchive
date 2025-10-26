package PI.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import PI.backend.models.Manga;

public interface MangaRepository extends JpaRepository<Manga, Long> {
}
