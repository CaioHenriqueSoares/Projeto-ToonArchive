package PI.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import PI.backend.models.Manga;
import PI.backend.repositories.MangaRepository;

@RestController
@RequestMapping("/mangas")
@CrossOrigin(origins = "*")
public class MangaController {

    @Autowired
    private MangaRepository mangaRepository;

    @GetMapping
    public List<Manga> listarMangas() {
        return mangaRepository.findAll();
    }

    @PostMapping
    public Manga criarManga(@RequestBody Manga manga) {
        return mangaRepository.save(manga);
    }
}
