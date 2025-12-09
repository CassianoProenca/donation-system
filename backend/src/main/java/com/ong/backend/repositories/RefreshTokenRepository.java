package com.ong.backend.repositories;

import com.ong.backend.models.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.usuarioId = :usuarioId")
    void deleteByUsuarioId(Long usuarioId);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.usuarioId = :usuarioId")
    void revokeByUsuarioId(Long usuarioId);

    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.usuarioId = :usuarioId AND rt.revoked = false")
    Long countActiveTokensByUsuarioId(Long usuarioId);
}

