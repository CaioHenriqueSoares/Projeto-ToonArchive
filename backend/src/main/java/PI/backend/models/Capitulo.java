package PI.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(
    name = "capitulo",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"manga_id", "numero"})
    }
)
public class Capitulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tituloCapitulo;

    @Column(nullable = false)
    private Double numero;

    // 🔹 Texto simples evita problemas de LOB stream
    @Column(columnDefinition = "TEXT")
    private String paginas;

    @Column(name = "data_publicacao")
    private LocalDateTime dataPublicacao;

    // 🔹 Evita loop JSON (manga -> capitulo -> manga)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manga_id", nullable = false)
    @JsonIgnoreProperties({"capitulos", "comentarios"}) // evita loop
    private Manga manga;


    // ======== GETTERS E SETTERS ========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTituloCapitulo() { return tituloCapitulo; }
    public void setTituloCapitulo(String tituloCapitulo) { this.tituloCapitulo = tituloCapitulo; }

    public double getNumero() { return numero; }
    public void setNumero(double numero) { this.numero = numero; }

    public String getPaginas() { return paginas; }
    public void setPaginas(String paginas) { this.paginas = paginas; }

    public LocalDateTime getDataPublicacao() { return dataPublicacao; }
    public void setDataPublicacao(LocalDateTime dataPublicacao) { this.dataPublicacao = dataPublicacao; }

    public Manga getManga() { return manga; }
    public void setManga(Manga manga) { this.manga = manga; }
}
