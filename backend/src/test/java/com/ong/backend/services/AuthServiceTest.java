package com.ong.backend.services;

import com.ong.backend.dto.auth.LoginRequestDTO;
import com.ong.backend.dto.auth.RefreshTokenResponseDTO;
import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.models.PerfilUsuario;
import com.ong.backend.models.RefreshToken;
import com.ong.backend.models.Usuario;
import com.ong.backend.repositories.UsuarioRepository;
import com.ong.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    private Usuario usuario;
    private RefreshToken refreshToken;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("João Silva");
        usuario.setEmail("joao@email.com");
        usuario.setSenha("senha123");
        usuario.setPerfil(PerfilUsuario.ADMIN);

        refreshToken = new RefreshToken();
        refreshToken.setId(1L);
        refreshToken.setToken("refresh-token-123");
        refreshToken.setUsuarioId(1L);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshToken.setRevoked(false);
    }

    @Test
    void deveFazerLoginComSucesso() {
        // Given
        LoginRequestDTO loginRequest = new LoginRequestDTO("joao@email.com", "senha123");
        String accessToken = "access-token-123";

        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(usuario));
        when(jwtUtil.generateAccessToken(anyString(), any(), anyString(), anyString())).thenReturn(accessToken);
        when(refreshTokenService.createRefreshToken(any())).thenReturn(refreshToken);

        // When
        var result = authService.login(loginRequest);

        // Then
        assertNotNull(result);
        assertEquals(accessToken, result.accessToken());
        assertEquals(refreshToken.getToken(), result.refreshToken());
        assertEquals(usuario.getId(), result.usuarioId());
        assertEquals(usuario.getNome(), result.nome());
        assertEquals(usuario.getEmail(), result.email());
        assertEquals(usuario.getPerfil(), result.perfil());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil, times(1)).generateAccessToken(anyString(), any(), anyString(), anyString());
        verify(refreshTokenService, times(1)).createRefreshToken(usuario.getId());
    }

    @Test
    void deveLancarExcecaoQuandoCredenciaisInvalidas() {
        // Given
        LoginRequestDTO loginRequest = new LoginRequestDTO("joao@email.com", "senhaErrada");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Credenciais inválidas"));

        // When/Then
        assertThrows(BusinessException.class, () -> {
            authService.login(loginRequest);
        });

        verify(usuarioRepository, never()).findByEmail(anyString());
        verify(jwtUtil, never()).generateAccessToken(anyString(), any(), anyString(), anyString());
    }

    @Test
    void deveFazerRefreshTokenComSucesso() {
        // Given
        String oldRefreshToken = "old-refresh-token";
        String newAccessToken = "new-access-token";
        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setToken("new-refresh-token");
        newRefreshToken.setUsuarioId(1L);

        when(refreshTokenService.validateRefreshToken(oldRefreshToken)).thenReturn(refreshToken);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(jwtUtil.generateAccessToken(anyString(), any(), anyString(), anyString())).thenReturn(newAccessToken);
        when(refreshTokenService.rotateRefreshToken(oldRefreshToken, 1L)).thenReturn(newRefreshToken);

        // When
        RefreshTokenResponseDTO result = authService.refreshToken(oldRefreshToken);

        // Then
        assertNotNull(result);
        assertEquals(newAccessToken, result.accessToken());
        assertEquals(newRefreshToken.getToken(), result.refreshToken());

        verify(refreshTokenService, times(1)).validateRefreshToken(oldRefreshToken);
        verify(jwtUtil, times(1)).generateAccessToken(anyString(), any(), anyString(), anyString());
        verify(refreshTokenService, times(1)).rotateRefreshToken(oldRefreshToken, 1L);
    }

    @Test
    void deveFazerLogoutComSucesso() {
        // Given
        String refreshTokenValue = "refresh-token-123";

        // When
        authService.logout(refreshTokenValue);

        // Then
        verify(refreshTokenService, times(1)).revokeRefreshToken(refreshTokenValue);
    }

    @Test
    void deveFazerLogoutSemErroQuandoTokenInvalido() {
        // Given
        String invalidToken = "invalid-token";
        doThrow(new BusinessException("Token não encontrado"))
                .when(refreshTokenService).revokeRefreshToken(invalidToken);

        // When/Then - Não deve lançar exceção
        assertDoesNotThrow(() -> {
            authService.logout(invalidToken);
        });
    }

    @Test
    void deveFazerLogoutTodosDispositivos() {
        // Given
        Long usuarioId = 1L;

        // When
        authService.logoutAll(usuarioId);

        // Then
        verify(refreshTokenService, times(1)).revokeAllUserTokens(usuarioId);
    }
}

