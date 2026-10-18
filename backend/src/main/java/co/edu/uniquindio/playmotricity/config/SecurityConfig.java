package co.edu.uniquindio.playmotricity.config;

import co.edu.uniquindio.playmotricity.security.AccesoDenegadoHandler;
import co.edu.uniquindio.playmotricity.security.JwtAuthenticationFilter;
import co.edu.uniquindio.playmotricity.security.Rol;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AccesoDenegadoHandler accesoDenegadoHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, AccesoDenegadoHandler accesoDenegadoHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.accesoDenegadoHandler = accesoDenegadoHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        .accessDeniedHandler(accesoDenegadoHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/health", "/api/auth/login", "/api/auth/register/**").permitAll()
                        // Spring reenvia las excepciones no controladas a /error; sin esto un 500 llega como 401
                        .requestMatchers("/error").permitAll()
                        // Autorizacion por rol: los modulos exclusivos de cada rol van bajo su prefijo
                        .requestMatchers("/api/docente/**").hasRole(Rol.DOCENTE.name())
                        .requestMatchers("/api/padre/**").hasRole(Rol.PADRE.name())
                        .requestMatchers("/api/perfiles/**").hasAnyRole(Rol.DOCENTE.name(), Rol.PADRE.name())
                        .requestMatchers("/api/actividades/**").hasAnyRole(Rol.DOCENTE.name(), Rol.PADRE.name())
                        .requestMatchers("/api/asignaciones/**").hasAnyRole(Rol.DOCENTE.name(), Rol.PADRE.name())
                        .requestMatchers("/api/seguimiento/**").hasAnyRole(Rol.DOCENTE.name(), Rol.PADRE.name())
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
