package com.ong.backend.services;

import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.models.RefreshToken;
import com.ong.backend.repositories.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

  @Mock
  private RefreshTokenRepository refreshTokenRepository;

  @InjectMocks
  private RefreshTokenService refreshTokenService;

  @BeforeEach
  void setUpService() {
    ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpiration", 604800000L);
  }

  private RefreshToken validToken;
  private RefreshToken expiredToken;
  private RefreshToken revokedToken;

  @BeforeEach
  void setUp() {
    validToken = new RefreshToken();
    validToken.setId(1L);
    validToken.setToken("valid-token");
    validToken.setUsuarioId(1L);
    validToken.setExpiresAt(LocalDateTime.now().plusDays(7));
    validToken.setCreatedAt(LocalDateTime.now());
    validToken.setRevoked(false);

    expiredToken = new RefreshToken();
    expiredToken.setId(2L);
    expiredToken.setToken("expired-token");
    expiredToken.setUsuarioId(1L);
    expiredToken.setExpiresAt(LocalDateTime.now().minusDays(1));
    expiredToken.setCreatedAt(LocalDateTime.now().minusDays(8));
    expiredToken.setRevoked(false);

    revokedToken = new RefreshToken();
    revokedToken.setId(3L);
    revokedToken.setToken("revoked-token");
    revokedToken.setUsuarioId(1L);
    revokedToken.setExpiresAt(LocalDateTime.now().plusDays(7));
    revokedToken.setCreatedAt(LocalDateTime.now());
    revokedToken.setRevoked(true);
  }

  @Test
  void deveCriarRefreshToken() {
    // Given
    Long usuarioId = 1L;
    when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
      RefreshToken token = invocation.getArgument(0);
      token.setId(1L);
      return token;
    });

    // When
    RefreshToken result = refreshTokenService.createRefreshToken(usuarioId);

    // Then
    assertNotNull(result);
    assertNotNull(result.getToken());
    assertEquals(usuarioId, result.getUsuarioId());
    assertFalse(result.getRevoked());
    assertTrue(result.getExpiresAt().isAfter(LocalDateTime.now()));
    verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
  }

  @Test
  void deveValidarRefreshTokenValido() {
    // Given
    String tokenValue = "valid-token";
    when(refreshTokenRepository.findByToken(tokenValue)).thenReturn(Optional.of(validToken));

    // When
    RefreshToken result = refreshTokenService.validateRefreshToken(tokenValue);

    // Then
    assertNotNull(result);
    assertEquals(validToken, result);
    verify(refreshTokenRepository, times(1)).findByToken(tokenValue);
  }

  @Test
  void deveLancarExcecaoQuandoTokenNaoExiste() {
    // Given
    String tokenValue = "invalid-token";
    when(refreshTokenRepository.findByToken(tokenValue)).thenReturn(Optional.empty());

    // When/Then
    assertThrows(BusinessException.class, () -> {
      refreshTokenService.validateRefreshToken(tokenValue);
    });
  }

  @Test
  void deveLancarExcecaoQuandoTokenRevogado() {
    // Given
    String tokenValue = "revoked-token";
    when(refreshTokenRepository.findByToken(tokenValue)).thenReturn(Optional.of(revokedToken));

    // When/Then
    assertThrows(BusinessException.class, () -> {
      refreshTokenService.validateRefreshToken(tokenValue);
    });
  }

  @Test
  void deveLancarExcecaoQuandoTokenExpirado() {
    // Given
    String tokenValue = "expired-token";
    when(refreshTokenRepository.findByToken(tokenValue)).thenReturn(Optional.of(expiredToken));

    // When/Then
    assertThrows(BusinessException.class, () -> {
      refreshTokenService.validateRefreshToken(tokenValue);
    });
  }

  @Test
  void deveRevogarRefreshToken() {
    // Given
    String tokenValue = "valid-token";
    when(refreshTokenRepository.findByToken(tokenValue)).thenReturn(Optional.of(validToken));
    when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(validToken);

    // When
    refreshTokenService.revokeRefreshToken(tokenValue);

    // Then
    assertTrue(validToken.getRevoked());
    verify(refreshTokenRepository, times(1)).findByToken(tokenValue);
    verify(refreshTokenRepository, times(1)).save(validToken);
  }

  @Test
  void deveRevogarTodosTokensDoUsuario() {
    // Given
    Long usuarioId = 1L;

    // When
    refreshTokenService.revokeAllUserTokens(usuarioId);

    // Then
    verify(refreshTokenRepository, times(1)).revokeByUsuarioId(usuarioId);
  }

  @Test
  void deveRotacionarRefreshToken() {
    // Given
    String oldTokenValue = "old-token";
    Long usuarioId = 1L;
    when(refreshTokenRepository.findByToken(oldTokenValue)).thenReturn(Optional.of(validToken));
    when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
      RefreshToken token = invocation.getArgument(0);
      token.setId(2L);
      return token;
    });

    // When
    RefreshToken newToken = refreshTokenService.rotateRefreshToken(oldTokenValue, usuarioId);

    // Then
    assertNotNull(newToken);
    assertNotEquals(oldTokenValue, newToken.getToken());
    assertTrue(validToken.getRevoked()); // Token antigo foi revogado
    verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
  }
}
