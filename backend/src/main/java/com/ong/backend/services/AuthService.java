package com.ong.backend.services;

import com.ong.backend.dto.auth.LoginRequestDTO;
import com.ong.backend.dto.auth.LoginResponseDTO;
import com.ong.backend.dto.auth.RefreshTokenResponseDTO;
import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.models.RefreshToken;
import com.ong.backend.models.Usuario;
import com.ong.backend.repositories.UsuarioRepository;
import com.ong.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO dto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), dto.senha()));

            Usuario usuario = usuarioRepository.findByEmail(dto.email())
                    .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

            String accessToken = jwtUtil.generateAccessToken(
                    usuario.getEmail(),
                    usuario.getId(),
                    usuario.getNome(),
                    usuario.getPerfil().name());

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(usuario.getId());

            return new LoginResponseDTO(
                    accessToken,
                    refreshToken.getToken(),
                    usuario.getId(),
                    usuario.getNome(),
                    usuario.getEmail(),
                    usuario.getPerfil());

        } catch (BadCredentialsException e) {
            throw new BusinessException("Email ou senha inválidos");
        }
    }

    @Transactional
    public RefreshTokenResponseDTO refreshToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.validateRefreshToken(refreshTokenValue);

        Usuario usuario = usuarioRepository.findById(refreshToken.getUsuarioId())
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        String newAccessToken = jwtUtil.generateAccessToken(
                usuario.getEmail(),
                usuario.getId(),
                usuario.getNome(),
                usuario.getPerfil().name());

        RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(
                refreshTokenValue,
                usuario.getId());

        return new RefreshTokenResponseDTO(
                newAccessToken,
                newRefreshToken.getToken());
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        if (refreshTokenValue != null && !refreshTokenValue.isEmpty()) {
            try {
                refreshTokenService.revokeRefreshToken(refreshTokenValue);
            } catch (BusinessException e) {
            }
        }
    }

    @Transactional
    public void logoutAll(Long usuarioId) {
        refreshTokenService.revokeAllUserTokens(usuarioId);
    }
}
