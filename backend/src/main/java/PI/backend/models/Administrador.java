package PI.backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;


@Entity
public class Administrador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String login;
    
    private String senha;

    // Getters
    public Long getId() { return id; }
    public String getLogin() { return login; }
    
    public String getSenha() { return senha; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setLogin(String login) { this.login = login; }
    public void setSenha(String senha) { this.senha = senha; }
}
