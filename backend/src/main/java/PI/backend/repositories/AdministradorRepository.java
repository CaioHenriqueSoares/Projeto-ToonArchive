package PI.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import PI.backend.models.Administrador;

public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
    Optional<Administrador> findByLogin(String login);
}
