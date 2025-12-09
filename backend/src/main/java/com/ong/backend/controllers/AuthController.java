package com.ong.backend.controllers;

import com.ong.backend.dto.auth.LoginRequestDTO;
import com.ong.backend.dto.auth.LoginResponseDTO;
import com.ong.backend.dto.auth.RefreshTokenResponseDTO;
import com.ong.backend.services.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final int REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO dto,
            HttpServletResponse response) {

        LoginResponseDTO loginResponse = authService.login(dto);

        if (loginResponse.refreshToken() != null) {
            Cookie refreshTokenCookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, loginResponse.refreshToken());
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setSecure(true);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(REFRESH_TOKEN_COOKIE_MAX_AGE);
            refreshTokenCookie.setAttribute("SameSite", "Strict");
            response.addCookie(refreshTokenCookie);
        }

        LoginResponseDTO responseBody = new LoginResponseDTO(
                loginResponse.accessToken(),
                null,
                loginResponse.usuarioId(),
                loginResponse.nome(),
                loginResponse.email(),
                loginResponse.perfil());

        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponseDTO> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {

        String refreshToken = extractRefreshTokenFromCookie(request);

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        RefreshTokenResponseDTO refreshResponse = authService.refreshToken(refreshToken);

        Cookie refreshTokenCookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, refreshResponse.refreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(REFRESH_TOKEN_COOKIE_MAX_AGE);
        refreshTokenCookie.setAttribute("SameSite", "Strict");
        response.addCookie(refreshTokenCookie);

        return ResponseEntity.ok(refreshResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        String refreshToken = extractRefreshTokenFromCookie(request);

        if (refreshToken != null && !refreshToken.isEmpty()) {
            authService.logout(refreshToken);
        }

        Cookie refreshTokenCookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, "");
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(refreshTokenCookie);

        return ResponseEntity.ok().build();
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
