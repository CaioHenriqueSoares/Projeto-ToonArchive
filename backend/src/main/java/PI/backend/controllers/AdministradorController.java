package PI.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

import PI.backend.models.Administrador;
import PI.backend.repositories.AdministradorRepository;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdministradorController {

    @Autowired
    private AdministradorRepository administradorRepository;

    /**
     * Autentica administrador a partir da tabela 'administrador'.
     * Retorna JSON com formato compatível com o frontend:
     * { status: "OK", apelido: "<login>", id: <id>, tipo: "admin" }
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String,Object> body) {
    String login = (String) (body.get("login") != null ? body.get("login") : body.get("apelido"));
    String senha = (String) body.get("senha");

        if (login == null || senha == null) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("status", "ERR");
            resp.put("mensagem", "Login ou senha ausentes.");
            return ResponseEntity.badRequest().body(resp);
        }

        Optional<Administrador> encontrado = administradorRepository.findByLogin(login);

        if (encontrado.isPresent()) {
            Administrador a = encontrado.get();
            // Atenção: se futuramente usar hash (BCrypt), troque esta comparação simples.
            if (a.getSenha() != null && a.getSenha().equals(senha)) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("status", "OK");
                resp.put("apelido", a.getLogin());
                resp.put("id", a.getId());
                resp.put("tipo", "admin");
                // pode retornar "usuario" object se quiser compatibilidade extra:
                resp.put("usuario", Map.of("id", a.getId(), "apelido", a.getLogin(), "tipo", "admin"));
                return ResponseEntity.ok(resp);
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "ERR");
        resp.put("mensagem", "Credenciais inválidas.");
        return ResponseEntity.status(401).body(resp);
    }

    @GetMapping
    public ResponseEntity<?> listarAdmins() {
        return ResponseEntity.ok(administradorRepository.findAll());
    }
}
