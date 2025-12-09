package com.ong.backend.dto.auth;

public record RefreshTokenResponseDTO(
    String accessToken,
    String refreshToken
) {}

