package PI.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 🔹 Desativa CSRF para facilitar requisições de formulários e uploads
            .csrf(csrf -> csrf.disable())
            

            // 🔹 Libera completamente as rotas públicas
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/imagens/**",     // imagens públicas
                    "/uploads/**",     // fallback
                    "/mangas/**",      // API pública
                    "/usuarios/**",    // login/cadastro
                    "/capitulos/**",   // capítulos
                    "/comentarios/**", // comentários
                    "/admin/**"        // painel administrativo
                ).permitAll()
                .anyRequest().permitAll()
            );

        // 🔹 Evita redirecionamento para formulário de login padrão do Spring
        http.formLogin(form -> form.disable());

        return http.build();
    }
}
