package PI.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Desativa CSRF (necessário para permitir POSTs de fora)
            .csrf(csrf -> csrf.disable())
            // Libera todas as rotas (sem exigir autenticação)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            // Desativa o login padrão do Spring Security
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(form -> form.disable());

        return http.build();
    }
}
