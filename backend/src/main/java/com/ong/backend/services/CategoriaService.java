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
import lombok.extern.slf4j.Slf4j;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "categorias", key = "'todas'")
    public List<CategoriaResponseDTO> listarTodas() {
        log.debug("Buscando todas as categorias");
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
    @Cacheable(value = "categorias", key = "'simples'")
    public List<CategoriaSimplesDTO> listarTodasSimples() {
        log.debug("Buscando categorias simples");
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
    @CacheEvict(value = "categorias", allEntries = true)
    public CategoriaResponseDTO criar(CategoriaRequestDTO dto) {
        log.info("Criando nova categoria: {}", dto.nome());
        if (categoriaRepository.existsByNome(dto.nome())) {
            log.warn("Tentativa de criar categoria duplicada: {}", dto.nome());
            throw new BusinessException("Já existe uma categoria com o nome: " + dto.nome());
        }

        Categoria categoria = new Categoria();
        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        categoria.setIcone(dto.icone());

        categoria = categoriaRepository.save(categoria);
        log.info("Categoria criada com sucesso. ID: {}", categoria.getId());
        return new CategoriaResponseDTO(categoria);
    }

    @Transactional
    @CacheEvict(value = "categorias", allEntries = true)
    public CategoriaResponseDTO atualizar(Long id, CategoriaRequestDTO dto) {
        log.info("Atualizando categoria ID: {}", id);
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));

        if (!categoria.getNome().equals(dto.nome()) && categoriaRepository.existsByNome(dto.nome())) {
            log.warn("Tentativa de atualizar categoria com nome duplicado: {}", dto.nome());
            throw new BusinessException("Já existe uma categoria com o nome: " + dto.nome());
        }

        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        categoria.setIcone(dto.icone());

        categoria = categoriaRepository.save(categoria);
        log.info("Categoria atualizada com sucesso. ID: {}", categoria.getId());
        return new CategoriaResponseDTO(categoria);
    }

    @Transactional
    @CacheEvict(value = "categorias", allEntries = true)
    public void deletar(Long id) {
        log.info("Deletando categoria ID: {}", id);
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));

        categoriaRepository.delete(categoria);
        log.info("Categoria deletada com sucesso. ID: {}", id);
    }

    @Transactional(readOnly = true)
    public Categoria buscarEntidadePorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));
    }
}
