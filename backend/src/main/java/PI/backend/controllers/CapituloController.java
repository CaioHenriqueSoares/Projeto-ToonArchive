package PI.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import PI.backend.models.Capitulo;
import PI.backend.models.Manga;
import PI.backend.repositories.CapituloRepository;
import PI.backend.repositories.MangaRepository;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/capitulos")
@CrossOrigin(origins = "*")
public class CapituloController {

    @Autowired
    private CapituloRepository capituloRepository;

    @Autowired
    private MangaRepository mangaRepository;

    // =========================================================
    // 🔹 Criar um novo capítulo
    // =========================================================
   @PostMapping
public ResponseEntity<?> criarCapitulo(
        @RequestParam(value = "mangaId", required = false) Long mangaId,
        @RequestParam("tituloCapitulo") String tituloCapitulo,
        @RequestParam("numero") Double numero,
        @RequestParam(value = "paginas", required = false) List<MultipartFile> paginas
) throws IOException {

    Manga manga;

    // 🧠 Se mangaId for nulo, associa automaticamente ao mangá mais recente
    if (mangaId == null) {
        Optional<Manga> mangaMaisRecente = mangaRepository.findAll()
                .stream()
                .max(Comparator.comparing(Manga::getId));

        if (mangaMaisRecente.isEmpty()) {
            return ResponseEntity.badRequest().body("❌ Nenhum mangá encontrado para associar o capítulo.");
        }

        manga = mangaMaisRecente.get();
        mangaId = manga.getId();
    } else {
        Optional<Manga> mangaOpt = mangaRepository.findById(mangaId);
        if (mangaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        manga = mangaOpt.get();
    }

    // ⚠️ Verifica se já existe um capítulo com o mesmo número
    boolean existeDuplicado = capituloRepository.existsByMangaIdAndNumero(mangaId, numero);
    if (existeDuplicado) {
        System.err.println("❌ Já existe um capítulo com número " + numero + " para o mangá ID " + mangaId);
        return ResponseEntity.status(409).body("Já existe um capítulo com este número!");
    }

    // ✅ Criação do capítulo
    Capitulo capitulo = new Capitulo();
    capitulo.setManga(manga);
    capitulo.setTituloCapitulo(tituloCapitulo);
    capitulo.setNumero(numero);
    capitulo.setDataPublicacao(LocalDateTime.now());


    
    
    // 💾 Salvar páginas no servidor
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
        capitulo.setPaginas(sb.toString());
    }

    Capitulo salvo = capituloRepository.save(capitulo);
    System.out.println("✅ Capítulo salvo: " + salvo.getTituloCapitulo() + " (Manga ID: " + mangaId + ")");
    return ResponseEntity.ok(salvo);
}
    // =========================================================
    // 🔹 Listar capítulos de um mangá (ordenados)
    // =========================================================
  @GetMapping("/manga/{mangaId}")
public ResponseEntity<List<Capitulo>> listarPorManga(@PathVariable Long mangaId) {
    System.out.println("🔍 Buscando capítulos do mangá ID: " + mangaId);

    List<Capitulo> capitulos = capituloRepository.findByMangaId(mangaId);

    if (capitulos.isEmpty()) {
        System.out.println("⚠️ Nenhum capítulo encontrado para o mangá ID: " + mangaId);
        return ResponseEntity.ok(List.of());
    }

    // Evita erro de LazyInitialization / LOB ao converter pra JSON
    capitulos.forEach(cap -> cap.setManga(null));

    capitulos.sort(Comparator.comparingDouble(Capitulo::getNumero));
    System.out.println("📚 " + capitulos.size() + " capítulos encontrados para o mangá ID: " + mangaId);
    return ResponseEntity.ok(capitulos);
}


    // =========================================================
    // 🔹 Buscar um capítulo específico
    // =========================================================
    @GetMapping("/{id}")
    public ResponseEntity<Capitulo> buscarPorId(@PathVariable Long id) {
        System.out.println("🔍 Buscando capítulo ID: " + id);

        Optional<Capitulo> capituloOpt = capituloRepository.findById(id);
        if (capituloOpt.isPresent()) {
            return ResponseEntity.ok(capituloOpt.get());
        } else {
            System.err.println("❌ Capítulo não encontrado: " + id);
            return ResponseEntity.notFound().build();
        }
    }





  // =========================================================
// 🔹 Atualizar um capítulo existente (com validação de número duplicado)
// =========================================================
@PutMapping("/{id}")
public ResponseEntity<?> atualizarCapitulo(
        @PathVariable Long id,
        @RequestParam(value = "tituloCapitulo", required = false) String tituloCapitulo,
        @RequestParam(value = "numero", required = false) Double numero,
        @RequestParam(value = "paginas", required = false) List<MultipartFile> paginas
) throws IOException {

    Optional<Capitulo> capituloOpt = capituloRepository.findById(id);
    if (capituloOpt.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    Capitulo capitulo = capituloOpt.get();

    // 🔹 Atualiza o título, se informado
    if (tituloCapitulo != null && !tituloCapitulo.isBlank()) {
        capitulo.setTituloCapitulo(tituloCapitulo);
    }

    // 🔹 Verifica duplicata de número antes de atualizar
if (numero != null) {
    boolean duplicado = capituloRepository
            .existsByMangaIdAndNumero(capitulo.getManga().getId(), numero);

    // só bloqueia se já existir OUTRO capítulo com o mesmo número
    if (duplicado && Double.compare(capitulo.getNumero(), numero) != 0) {
        System.err.println("❌ Já existe um capítulo com número " + numero + " neste mangá.");
        return ResponseEntity.status(409).body("Já existe um capítulo com este número!");
    }

    capitulo.setNumero(numero);
}


    // 🔹 Substituir páginas (se enviadas)
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
        capitulo.setPaginas(sb.toString());
    }

    Capitulo atualizado = capituloRepository.save(capitulo);
    System.out.println("✅ Capítulo atualizado: " + atualizado.getTituloCapitulo());
    return ResponseEntity.ok(atualizado);
}

    // =========================================================
    // 🔹 Deletar um capítulo
    // =========================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCapitulo(@PathVariable Long id) {
        System.out.println("🗑️ Solicitando exclusão do capítulo ID: " + id);

        if (capituloRepository.existsById(id)) {
            capituloRepository.deleteById(id);
            System.out.println("✅ Capítulo excluído com sucesso!");
            return ResponseEntity.noContent().build();
        } else {
            System.err.println("❌ Capítulo não encontrado para exclusão: " + id);
            return ResponseEntity.notFound().build();
        }
    }

    
}
