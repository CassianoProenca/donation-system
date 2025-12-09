package com.ong.backend.dto.auth;

import com.ong.backend.models.PerfilUsuario;

public record LoginResponseDTO(
        String accessToken,
        String refreshToken,
        String tipo,
        Long usuarioId,
        String nome,
        String email,
        PerfilUsuario perfil) {
    public LoginResponseDTO(String accessToken, Long usuarioId, String nome, String email, PerfilUsuario perfil) {
        this(accessToken, null, "Bearer", usuarioId, nome, email, perfil);
    }

    public LoginResponseDTO(String accessToken, String refreshToken, Long usuarioId, String nome, String email,
            PerfilUsuario perfil) {
        this(accessToken, refreshToken, "Bearer", usuarioId, nome, email, perfil);
    }
}
