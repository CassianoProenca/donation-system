package com.ong.backend.services;

import com.ong.backend.dto.usuario.UsuarioRequestDTO;
import com.ong.backend.dto.usuario.UsuarioResponseDTO;
import com.ong.backend.dto.usuario.UsuarioSimplesDTO;
import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.exceptions.ResourceNotFoundException;
import com.ong.backend.models.Usuario;
import com.ong.backend.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarComFiltros(String nome, String email, String perfil) {
        List<Usuario> usuarios = usuarioRepository.findAll();
        
        return usuarios.stream()
                .filter(u -> nome == null || nome.trim().isEmpty() || u.getNome().toLowerCase().contains(nome.trim().toLowerCase()))
                .filter(u -> email == null || email.trim().isEmpty() || u.getEmail().toLowerCase().contains(email.trim().toLowerCase()))
                .filter(u -> perfil == null || perfil.trim().isEmpty() || u.getPerfil().name().equalsIgnoreCase(perfil.trim()))
                .map(UsuarioResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UsuarioSimplesDTO> listarTodosSimples() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioSimplesDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", id));
        return new UsuarioResponseDTO(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "email", email));
        return new UsuarioResponseDTO(usuario);
    }

    @Transactional
    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new BusinessException("Já existe um usuário com o email: " + dto.email());
        }

        if (dto.senha() == null || dto.senha().isBlank()) {
            throw new BusinessException("Senha é obrigatória ao criar um usuário");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuario.setPerfil(dto.perfil());

        usuario = usuarioRepository.save(usuario);
        return new UsuarioResponseDTO(usuario);
    }

    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", id));

        if (!usuario.getEmail().equals(dto.email()) && usuarioRepository.existsByEmail(dto.email())) {
            throw new BusinessException("Já existe um usuário com o email: " + dto.email());
        }

        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        
        if (dto.senha() != null && !dto.senha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.senha()));
        }
        
        usuario.setPerfil(dto.perfil());

        usuario = usuarioRepository.save(usuario);
        return new UsuarioResponseDTO(usuario);
    }

    @Transactional
    public void deletar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", id));

        usuarioRepository.delete(usuario);
    }

    @Transactional(readOnly = true)
    public Usuario buscarEntidadePorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", id));
    }
}
