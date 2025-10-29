package PI.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import PI.backend.models.Manga;
import PI.backend.models.Capitulo;
import PI.backend.repositories.MangaRepository;
import PI.backend.repositories.CapituloRepository;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/mangas")
@CrossOrigin(origins = "*")
public class MangaController {

    @Autowired
    private MangaRepository mangaRepository;

    @Autowired
    private CapituloRepository capituloRepository;

    // 🔹 CRIAR MANGÁ
    @PostMapping
    public ResponseEntity<Manga> criarManga(
            @RequestParam("nome") String nome,
            @RequestParam("autor") String autor,
            @RequestParam("editora") String editora,
            @RequestParam("ano") int ano,
            @RequestParam("descricao") String descricao,
            @RequestParam(value = "capitulo", required = false) String capitulo,
            @RequestParam(value = "tituloCapitulo", required = false) String tituloCapitulo,
            @RequestParam(value = "capa", required = false) MultipartFile capa,
            @RequestParam(value = "paginas", required = false) List<MultipartFile> paginas
    ) throws IOException {

        Manga manga = new Manga();
        manga.setNome(nome);
        manga.setAutor(autor);
        manga.setEditora(editora);
        manga.setAno(ano);
        manga.setDescricao(descricao);
        manga.setCapitulo(capitulo);
        manga.setTituloCapitulo(tituloCapitulo);
        manga.setDataPublicacao(LocalDateTime.now());

        // 🔹 SALVAR CAPA NO SERVIDOR
        if (capa != null && !capa.isEmpty()) {
            String nomeArquivo = System.currentTimeMillis() + "_" + capa.getOriginalFilename();
            File destino = new File(System.getProperty("user.dir") + "/uploads/" + nomeArquivo);
            capa.transferTo(destino);
            manga.setCapa("/imagens/" + nomeArquivo);
        }

        // 🔹 SALVAR PÁGINAS (se existirem)
        if (paginas != null && !paginas.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (MultipartFile file : paginas) {
                if (!file.isEmpty()) {
                    String nomePagina = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    File destino = new File(System.getProperty("user.dir") + "/uploads/" + nomePagina);
                    file.transferTo(destino);
                    sb.append("/imagens/").append(nomePagina).append(";");
                }
            }
            manga.setPaginas(sb.toString());
        }

        Manga salvo = mangaRepository.save(manga);
        return ResponseEntity.ok(salvo);
    }

    // 🔹 LISTAR TODOS OS MANGÁS
    @GetMapping
    public List<Manga> listarTodos() {
        return mangaRepository.findAll();
    }

    

    // 🔹 BUSCAR UM MANGÁ POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Manga> buscarPorId(@PathVariable Long id) {
        Optional<Manga> mangaOpt = mangaRepository.findById(id);
        return mangaOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

  // 🔹 BUSCAR MANGÁS POR NOME
@GetMapping("/buscar")
public ResponseEntity<List<Manga>> buscarPorNome(@RequestParam(value = "nome", required = false) String nome) {
    if (nome == null || nome.trim().isEmpty()) {
        return ResponseEntity.badRequest().build();
    }

    List<Manga> resultados = mangaRepository.findByNomeContainingIgnoreCase(nome.trim());
    return ResponseEntity.ok(resultados);
}



    // 🔹 DELETAR UM MANGÁ
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (mangaRepository.existsById(id)) {
            mangaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
