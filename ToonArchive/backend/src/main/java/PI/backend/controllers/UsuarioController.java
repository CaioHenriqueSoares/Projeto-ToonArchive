package PI.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import PI.backend.models.Usuario;
import PI.backend.repositories.UsuarioRepository;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*") // Permite requisições do frontend
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // 🔹 LISTAR todos os usuários
    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // 🔹 CRIAR novo usuário
    @PostMapping
    public Usuario criarUsuario(@RequestBody Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    // 🔹 LOGIN de usuário (versão segura)
    @PostMapping("/login")
    public String login(@RequestBody Usuario usuario) {
        Optional<Usuario> userOpt = usuarioRepository.findByApelido(usuario.getApelido());

        if (userOpt.isPresent()) {
            Usuario user = userOpt.get();
            // Verifica a senha
            if (user.getSenha().equals(usuario.getSenha())) {
                return "Login OK!";
            } else {
                return "Senha incorreta!";
            }
        } else {
            return "Usuário não encontrado!";
        }
    }
}
