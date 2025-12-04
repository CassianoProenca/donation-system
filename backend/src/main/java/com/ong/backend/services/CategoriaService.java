package com.ong.backend.services;

import com.ong.backend.dto.categoria.CategoriaRequestDTO;
import com.ong.backend.dto.categoria.CategoriaResponseDTO;
import com.ong.backend.dto.categoria.CategoriaSimplesDTO;
import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.exceptions.ResourceNotFoundException;
import com.ong.backend.models.Categoria;
import com.ong.backend.repositories.CategoriaRepository;
import com.ong.backend.specifications.CategoriaSpecs;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listarTodas() {
        return categoriaRepository.findAll()
                .stream()
                .map(CategoriaResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<CategoriaResponseDTO> listarComFiltros(String nome, Pageable pageable) {
        return categoriaRepository.findAll(CategoriaSpecs.comFiltros(nome), pageable)
                .map(CategoriaResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public List<CategoriaSimplesDTO> listarTodasSimples() {
        return categoriaRepository.findAll()
                .stream()
                .map(CategoriaSimplesDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponseDTO buscarPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));
        return new CategoriaResponseDTO(categoria);
    }

    @Transactional
    public CategoriaResponseDTO criar(CategoriaRequestDTO dto) {
        if (categoriaRepository.existsByNome(dto.nome())) {
            throw new BusinessException("Já existe uma categoria com o nome: " + dto.nome());
        }

        Categoria categoria = new Categoria();
        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        categoria.setIcone(dto.icone());

        categoria = categoriaRepository.save(categoria);
        return new CategoriaResponseDTO(categoria);
    }

    @Transactional
    public CategoriaResponseDTO atualizar(Long id, CategoriaRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));

        if (!categoria.getNome().equals(dto.nome()) && categoriaRepository.existsByNome(dto.nome())) {
            throw new BusinessException("Já existe uma categoria com o nome: " + dto.nome());
        }

        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        categoria.setIcone(dto.icone());

        categoria = categoriaRepository.save(categoria);
        return new CategoriaResponseDTO(categoria);
    }

    @Transactional
    public void deletar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));

        categoriaRepository.delete(categoria);
    }

    @Transactional(readOnly = true)
    public Categoria buscarEntidadePorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));
    }
}
