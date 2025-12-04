package PI.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "manga")
public class Manga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String autor;
    private String editora;
    private String tituloCapitulo;
    private int ano;

    @Column(length = 2000)
    private String descricao;

    private String capitulo;

    private String capa;

    // 🔹 Texto simples evita erro de LOB stream
    @Column(columnDefinition = "TEXT")
    private String paginas;

    @Column(name = "data_publicacao")
    private LocalDateTime dataPublicacao;

    // 🔹 Evita loop JSON ao listar mangá -> capítulos
    @OneToMany(mappedBy = "manga", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"manga"}) // substitui o JsonManagedReference
    private List<Capitulo> capitulos;



    // ======== GETTERS E SETTERS ========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public String getEditora() { return editora; }
    public void setEditora(String editora) { this.editora = editora; }

    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getCapitulo() { return capitulo; }
    public void setCapitulo(String capitulo) { this.capitulo = capitulo; }

    public String getCapa() { return capa; }
    public void setCapa(String capa) { this.capa = capa; }

    public String getPaginas() { return paginas; }
    public void setPaginas(String paginas) { this.paginas = paginas; }

    public LocalDateTime getDataPublicacao() { return dataPublicacao; }
    public void setDataPublicacao(LocalDateTime dataPublicacao) { this.dataPublicacao = dataPublicacao; }

    public String getTituloCapitulo() { return tituloCapitulo; }
    public void setTituloCapitulo(String tituloCapitulo) { this.tituloCapitulo = tituloCapitulo; }

    public List<Capitulo> getCapitulos() { return capitulos; }
    public void setCapitulos(List<Capitulo> capitulos) { this.capitulos = capitulos; }
}
