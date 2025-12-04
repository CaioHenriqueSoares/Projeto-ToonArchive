package PI.backend.config; // Use seu pacote de configuração

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        
        // 1. Usa a classe Paths do Java para resolver o caminho absoluto da pasta 'uploads'
        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");
        
        // 2. Cria a string no formato URI que o Spring Boot entende: file:/caminho/uploads/
        // O '.toUri().toString()' garante a barra (/) no final e o prefixo correto 'file:/'
        String resourceLocation = uploadDir.toUri().toString(); 
        // 3. Registra o mapeamento
        registry.addResourceHandler("/imagens/**")
                .addResourceLocations(resourceLocation);
    }
}