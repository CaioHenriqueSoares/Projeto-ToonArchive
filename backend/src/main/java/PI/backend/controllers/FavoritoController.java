package PI.backend.controllers;

import PI.backend.models.Manga;
import PI.backend.services.FavoritoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/favoritos")
@CrossOrigin(origins = "*")
public class FavoritoController {

    @Autowired
    private FavoritoService favoritoService;

    // Helper: extrai usuarioId do header X-User-Id ou query param userId
    private Long extractUserId(HttpServletRequest req) {
        String header = req.getHeader("X-User-Id");
        if (header != null && !header.isBlank()) {
            try { return Long.parseLong(header); } catch (NumberFormatException e) {}
        }
        String q = req.getParameter("userId");
        if (q != null && !q.isBlank()) {
            try { return Long.parseLong(q); } catch (NumberFormatException e) {}
        }
        return null;
    }

    // Toggle favorito: POST /favoritos/toggle/{mangaId}
    @PostMapping("/toggle/{mangaId}")
    public ResponseEntity<?> toggle(@PathVariable Long mangaId, HttpServletRequest req) {
        Long usuarioId = extractUserId(req);
        if (usuarioId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId header/query missing"));
        }
        try {
            boolean agoraFavorito = favoritoService.toggleFavorito(usuarioId, mangaId);
            long total = favoritoService.countFavoritos(mangaId);
            return ResponseEntity.ok(Map.of("favorito", agoraFavorito, "total", total));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    // Check: GET /favoritos/check/{mangaId}?userId=3  (or header X-User-Id)
    @GetMapping("/check/{mangaId}")
    public ResponseEntity<?> check(@PathVariable Long mangaId, HttpServletRequest req) {
        Long usuarioId = extractUserId(req);
        if (usuarioId == null) return ResponseEntity.badRequest().body(Map.of("error","userId missing"));
        boolean favor = favoritoService.isFavorito(usuarioId, mangaId);
        return ResponseEntity.ok(Map.of("favorito", favor));
    }

    // Listar favoritos do usuario: GET /favoritos/usuario?userId=3
    @GetMapping("/usuario")
    public ResponseEntity<?> listarUsuario(HttpServletRequest req) {
        Long usuarioId = extractUserId(req);
        if (usuarioId == null) return ResponseEntity.badRequest().body(Map.of("error","userId missing"));
        List<Manga> lista = favoritoService.listarFavoritosDoUsuario(usuarioId);
        return ResponseEntity.ok(lista);
    }

    // Top N: GET /favoritos/top?limit=3
    @GetMapping("/top")
    public ResponseEntity<?> top(@RequestParam(defaultValue = "3") int limit) {
        List<Manga> top = favoritoService.topFavoritos(limit);
        return ResponseEntity.ok(top);
    }
}
