package PI.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import PI.backend.models.Comentario;
import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    // 🔹 Buscar comentários por MANGÁ (em ordem decrescente de data)
    List<Comentario> findByMangaIdOrderByDataHoraDesc(Long mangaId);

    // 🔹 Buscar comentários por CAPÍTULO (em ordem decrescente de data)
    List<Comentario> findByCapituloIdOrderByDataHoraDesc(Long capituloId);
}
