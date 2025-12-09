package com.ong.backend.services;

import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.models.RefreshToken;
import com.ong.backend.repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private Long refreshTokenExpiration;

    @Transactional
    public RefreshToken createRefreshToken(Long usuarioId) {
        String token = UUID.randomUUID().toString() + "-" + System.currentTimeMillis();

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(token);
        refreshToken.setUsuarioId(usuarioId);
        refreshToken.setExpiresAt(expiresAt);
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshToken.setRevoked(false);

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Refresh token inválido"));

        if (refreshToken.getRevoked()) {
            throw new BusinessException("Refresh token foi revogado");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Refresh token expirado");
        }

        return refreshToken;
    }

    @Transactional
    public void revokeRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Refresh token não encontrado"));

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void revokeAllUserTokens(Long usuarioId) {
        refreshTokenRepository.revokeByUsuarioId(usuarioId);
    }

    @Transactional
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    @Transactional
    public RefreshToken rotateRefreshToken(String oldToken, Long usuarioId) {
        revokeRefreshToken(oldToken);
        return createRefreshToken(usuarioId);
    }
}
