package com.ong.backend.services;

import com.ong.backend.dto.produto.ProdutoRequestDTO;
import com.ong.backend.dto.produto.ProdutoResponseDTO;
import com.ong.backend.dto.produto.ProdutoSimplesDTO;
import com.ong.backend.dto.produto.ProdutoDetalhesDTO;
import com.ong.backend.exceptions.ResourceNotFoundException;
import com.ong.backend.models.Categoria;
import com.ong.backend.models.Produto;
import com.ong.backend.models.ComposicaoProduto;
import com.ong.backend.repositories.LoteRepository;
import com.ong.backend.repositories.ProdutoRepository;
import com.ong.backend.repositories.ComposicaoProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ong.backend.specifications.ProdutoSpecs;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final LoteRepository loteRepository;
    private final CategoriaService categoriaService;
    private final ComposicaoProdutoRepository composicaoProdutoRepository;

    @Transactional(readOnly = true)
    public Page<ProdutoResponseDTO> listarComFiltros(String nome, Long categoriaId, Pageable pageable) {
        return produtoRepository.findAll(ProdutoSpecs.comFiltros(nome, categoriaId), pageable)
                .map(ProdutoResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarComFiltros(String nome, Long categoriaId) {
        List<Produto> produtos = produtoRepository.findAll();
        
        return produtos.stream()
                .filter(p -> nome == null || nome.trim().isEmpty() || p.getNome().toLowerCase().contains(nome.trim().toLowerCase()))
                .filter(p -> categoriaId == null || p.getCategoria().getId().equals(categoriaId))
                .map(ProdutoResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarTodos() { 
         return produtoRepository.findAll()
                 .stream()
                 .map(ProdutoResponseDTO::new)
                 .toList();
    }

    @Transactional(readOnly = true)
    public List<ProdutoSimplesDTO> listarTodosSimples() {
        return produtoRepository.findAll()
                .stream()
                .map(ProdutoSimplesDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProdutoResponseDTO buscarPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));
        return new ProdutoResponseDTO(produto);
    }

    @Transactional(readOnly = true)
    public ProdutoDetalhesDTO buscarDetalhesPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));

        Integer totalEmEstoque = loteRepository.findAll()
                .stream()
                .flatMap(lote -> lote.getItens().stream())
                .filter(item -> item.getProduto().getId().equals(id))
                .mapToInt(item -> item.getQuantidade())
                .sum();

        return new ProdutoDetalhesDTO(produto, totalEmEstoque);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> buscarPorCategoria(Long categoriaId) {
        return produtoRepository.findByCategoriaId(categoriaId)
                .stream()
                .map(ProdutoResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> buscarPorNome(String nome) {
        return produtoRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(ProdutoResponseDTO::new)
                .toList();
    }

    @Transactional
    public ProdutoResponseDTO criar(ProdutoRequestDTO dto) {
        Categoria categoria = categoriaService.buscarEntidadePorId(dto.categoriaId());

        Produto produto = new Produto();
        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setCodigoBarrasFabricante(dto.codigoBarrasFabricante());
        produto.setCategoria(categoria);
        
        produto.setKit(dto.isKit() != null && dto.isKit());

        produto = produtoRepository.save(produto);

        if (produto.isKit() && dto.componentes() != null && !dto.componentes().isEmpty()) {
            for (var compDto : dto.componentes()) {
                Produto componente = buscarEntidadePorId(compDto.produtoId());
                
                ComposicaoProduto composicao = new ComposicaoProduto();
                composicao.setProdutoPai(produto);
                composicao.setComponente(componente);
                composicao.setQuantidade(compDto.quantidade());
                
                composicaoProdutoRepository.save(composicao);
                produto.getComponentes().add(composicao);
            }
        }

        return new ProdutoResponseDTO(produto);
    }

    @Transactional
    public ProdutoResponseDTO atualizar(Long id, ProdutoRequestDTO dto) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));

        Categoria categoria = categoriaService.buscarEntidadePorId(dto.categoriaId());

        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setCodigoBarrasFabricante(dto.codigoBarrasFabricante());
        produto.setCategoria(categoria);

        produto = produtoRepository.save(produto);
        return new ProdutoResponseDTO(produto);
    }

    @Transactional
    public void deletar(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));

        produtoRepository.delete(produto);
    }

    @Transactional(readOnly = true)
    public Produto buscarEntidadePorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));
    }
}
