package PI.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import PI.backend.models.Administrador;
import PI.backend.repositories.AdministradorRepository;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdministradorController {

    @Autowired
    private AdministradorRepository administradorRepository;

    @PostMapping("/login")
    public ResponseEntity<String> loginAdmin(@RequestBody Administrador adm) {
        String login = adm.getLogin();
        String senha = adm.getSenha();

        // Admin fixo
        if ("admin".equals(login) && "minecraftadmin".equals(senha)) {
            return ResponseEntity.ok("OK");
        }

        // Caso tenha outros admins no banco
        Optional<Administrador> encontrado = administradorRepository.findByLogin(login);
        if (encontrado.isPresent() && encontrado.get().getSenha().equals(senha)) {
            return ResponseEntity.ok("OK");
        }

        return ResponseEntity.status(401).body("Credenciais inválidas.");
    }

    @GetMapping
    public ResponseEntity<?> listarAdmins() {
        return ResponseEntity.ok(administradorRepository.findAll());
    }
}
