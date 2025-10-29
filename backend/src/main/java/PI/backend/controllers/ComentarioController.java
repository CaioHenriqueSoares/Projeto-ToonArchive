package PI.backend.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import PI.backend.models.Capitulo;
import PI.backend.models.Comentario;
import PI.backend.models.Manga;
import PI.backend.repositories.CapituloRepository;
import PI.backend.repositories.ComentarioRepository;
import PI.backend.repositories.MangaRepository;

@RestController
@RequestMapping("/comentarios")
@CrossOrigin(origins = "*")
public class ComentarioController {

    @Autowired
    private ComentarioRepository comentarioRepository;

    @Autowired
    private MangaRepository mangaRepository;

    @Autowired
    private CapituloRepository capituloRepository;

    // ==========================================================
    // 🔹 LISTAR COMENTÁRIOS POR MANGÁ
    // ==========================================================
    @GetMapping("/manga/{mangaId}")
    public ResponseEntity<List<Comentario>> listarPorManga(@PathVariable Long mangaId) {
        try {
            List<Comentario> comentarios = comentarioRepository.findByMangaIdOrderByDataHoraDesc(mangaId);
            comentarios.forEach(c -> c.setManga(null));
            return ResponseEntity.ok(comentarios);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==========================================================
    // 🔹 LISTAR COMENTÁRIOS POR CAPÍTULO
    // ==========================================================
    @GetMapping("/capitulo/{capituloId}")
    public ResponseEntity<List<Comentario>> listarPorCapitulo(@PathVariable Long capituloId) {
        try {
            List<Comentario> comentarios = comentarioRepository.findByCapituloIdOrderByDataHoraDesc(capituloId);
            comentarios.forEach(c -> {
                c.setCapitulo(null);
                c.setManga(null);
            });
            return ResponseEntity.ok(comentarios);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==========================================================
    // 🔹 CRIAR COMENTÁRIO (para MANGÁ ou CAPÍTULO)
    // ==========================================================
   @PostMapping
public ResponseEntity<?> criar(@RequestBody Comentario body) {
    try {
        if (body.getTexto() == null || body.getTexto().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Texto do comentário é obrigatório.");
        }

        Comentario novo = new Comentario();
        novo.setAutor(body.getAutor());
        novo.setTexto(body.getTexto());
        novo.setDataHora(LocalDateTime.now());

        if (body.getManga() != null && body.getManga().getId() != null) {
            Manga manga = mangaRepository.findById(body.getManga().getId())
                    .orElseThrow(() -> new RuntimeException("Mangá não encontrado"));
            novo.setManga(manga);
        } else if (body.getCapitulo() != null && body.getCapitulo().getId() != null) {
            Capitulo capitulo = capituloRepository.findById(body.getCapitulo().getId())
                    .orElseThrow(() -> new RuntimeException("Capítulo não encontrado"));
            novo.setCapitulo(capitulo);
        } else {
            return ResponseEntity.badRequest().body("Comentário precisa estar vinculado a um mangá ou capítulo.");
        }

        Comentario salvo = comentarioRepository.save(novo);
        salvo.setManga(null);
        salvo.setCapitulo(null);
        return ResponseEntity.ok(salvo);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().body("Erro interno: " + e.getMessage());
    }
}

    // ==========================================================
    // 🔹 ATUALIZAR COMENTÁRIO
    // ==========================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            Optional<Comentario> comentarioOpt = comentarioRepository.findById(id);
            if (comentarioOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Comentario c = comentarioOpt.get();
            String novoTexto = payload.get("texto");

            if (novoTexto == null || novoTexto.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Texto inválido");
            }

            c.setTexto(novoTexto.trim());
            c.setDataHora(LocalDateTime.now());
            comentarioRepository.save(c);

            c.setManga(null);
            c.setCapitulo(null);
            return ResponseEntity.ok(c);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao atualizar comentário");
        }
    }

    // ==========================================================
    // 🔹 EXCLUIR COMENTÁRIO
    // ==========================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!comentarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        comentarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
