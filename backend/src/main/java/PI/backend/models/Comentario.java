package PI.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "comentario")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // ✅ Ignora proxies do Hibernate
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String autor;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String texto;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    // ==============================================================
    // 🔹 Relacionamento com MANGÁ (opcional)
    // ==============================================================

   @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.MERGE)
@JoinColumn(name = "manga_id", nullable = true)
@JsonIgnoreProperties({"comentarios", "capitulos", "hibernateLazyInitializer", "handler"})
private Manga manga;

@ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.MERGE)
@JoinColumn(name = "capitulo_id", nullable = true)
@JsonIgnoreProperties({"comentarios", "manga", "hibernateLazyInitializer", "handler"})
private Capitulo capitulo;
    // ==============================================================
    // 🔹 Getters e Setters
    // ==============================================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public Manga getManga() { return manga; }
    public void setManga(Manga manga) { this.manga = manga; }

    public Capitulo getCapitulo() { return capitulo; }
    public void setCapitulo(Capitulo capitulo) { this.capitulo = capitulo; }
}
