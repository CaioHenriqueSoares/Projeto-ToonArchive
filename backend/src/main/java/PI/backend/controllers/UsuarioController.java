package PI.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;
import java.util.Objects;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
    public Map<String, String> login(@RequestBody Usuario usuario) {

    String login = usuario.getApelido();
    String senha = usuario.getSenha();

    Optional<Usuario> userOpt =
        usuarioRepository.findByApelidoOrEmail(login, login);

    Map<String, String> response = new HashMap<>();

    if (!userOpt.isPresent()) {
        response.put("status", "ERRO");
        response.put("mensagem", "Usuário não encontrado!");
        return response;
    }

    Usuario user = userOpt.get();

    if (!user.getSenha().equals(senha)) {
        response.put("status", "ERRO");
        response.put("mensagem", "Senha incorreta!");
        return response;
    }

    response.put("status", "OK");
    response.put("apelido", user.getApelido());
    return response;
}
}
