package com.ong.backend.services;

import com.ong.backend.dto.produto.ProdutoDetalhesDTO;
import com.ong.backend.dto.produto.ProdutoRequestDTO;
import com.ong.backend.dto.produto.ProdutoResponseDTO;
import com.ong.backend.exceptions.ResourceNotFoundException;
import com.ong.backend.models.Categoria;
import com.ong.backend.models.Produto;
import com.ong.backend.repositories.LoteItemRepository;
import com.ong.backend.repositories.ProdutoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ProdutoService")
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private LoteItemRepository loteItemRepository;

    @Mock
    private CategoriaService categoriaService;

    @Mock
    private com.ong.backend.repositories.ComposicaoProdutoRepository composicaoProdutoRepository;

    @InjectMocks
    private ProdutoService produtoService;

    private Categoria categoria;
    private Produto produto;
    private ProdutoRequestDTO produtoRequestDTO;

    @BeforeEach
    void setUp() {
        categoria = new Categoria();
        categoria.setId(1L);
        categoria.setNome("Alimentos");

        produto = new Produto();
        produto.setId(1L);
        produto.setNome("Arroz");
        produto.setDescricao("Arroz branco");
        produto.setCategoria(categoria);
        produto.setKit(false);

        produtoRequestDTO = new ProdutoRequestDTO(
                "Arroz",
                "Arroz branco",
                null,
                1L,
                false,
                null
        );
    }

    @Test
    @DisplayName("Deve buscar produto por ID com sucesso")
    void deveBuscarProdutoPorId() {
        // Given
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        // When
        ProdutoResponseDTO resultado = produtoService.buscarPorId(1L);

        // Then
        assertNotNull(resultado);
        assertEquals(1L, resultado.id());
        assertEquals("Arroz", resultado.nome());
        verify(produtoRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Deve lançar exceção quando produto não encontrado")
    void deveLancarExcecaoQuandoProdutoNaoEncontrado() {
        // Given
        when(produtoRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            produtoService.buscarPorId(999L);
        });
        verify(produtoRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("Deve calcular estoque total usando query otimizada")
    void deveCalcularEstoqueTotalComQueryOtimizada() {
        // Given
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(loteItemRepository.calcularEstoqueTotalPorProduto(1L)).thenReturn(150);

        // When
        ProdutoDetalhesDTO resultado = produtoService.buscarDetalhesPorId(1L);

        // Then
        assertNotNull(resultado);
        assertEquals(150, resultado.totalEmEstoque());
        // Verifica que a query otimizada foi chamada ao invés de carregar tudo em memória
        verify(loteItemRepository, times(1)).calcularEstoqueTotalPorProduto(1L);
        verify(loteItemRepository, never()).findAll();
    }

    @Test
    @DisplayName("Deve retornar zero quando produto não tem estoque")
    void deveRetornarZeroQuandoProdutoSemEstoque() {
        // Given
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(loteItemRepository.calcularEstoqueTotalPorProduto(1L)).thenReturn(0);

        // When
        ProdutoDetalhesDTO resultado = produtoService.buscarDetalhesPorId(1L);

        // Then
        assertNotNull(resultado);
        assertEquals(0, resultado.totalEmEstoque());
    }

    @Test
    @DisplayName("Deve criar produto com sucesso")
    void deveCriarProduto() {
        // Given
        when(categoriaService.buscarEntidadePorId(1L)).thenReturn(categoria);
        when(produtoRepository.save(any(Produto.class))).thenReturn(produto);

        // When
        ProdutoResponseDTO resultado = produtoService.criar(produtoRequestDTO);

        // Then
        assertNotNull(resultado);
        assertEquals(1L, resultado.id());
        assertEquals("Arroz", resultado.nome());
        verify(categoriaService, times(1)).buscarEntidadePorId(1L);
        verify(produtoRepository, times(1)).save(any(Produto.class));
    }

    @Test
    @DisplayName("Deve atualizar produto com sucesso")
    void deveAtualizarProduto() {
        // Given
        ProdutoRequestDTO dtoAtualizado = new ProdutoRequestDTO(
                "Arroz Integral",
                "Arroz integral",
                null,
                1L,
                false,
                null
        );

        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(categoriaService.buscarEntidadePorId(1L)).thenReturn(categoria);
        when(produtoRepository.save(any(Produto.class))).thenReturn(produto);

        // When
        ProdutoResponseDTO resultado = produtoService.atualizar(1L, dtoAtualizado);

        // Then
        assertNotNull(resultado);
        verify(produtoRepository, times(1)).findById(1L);
        verify(produtoRepository, times(1)).save(any(Produto.class));
    }

    @Test
    @DisplayName("Deve deletar produto com sucesso")
    void deveDeletarProduto() {
        // Given
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        doNothing().when(produtoRepository).delete(produto);

        // When
        produtoService.deletar(1L);

        // Then
        verify(produtoRepository, times(1)).findById(1L);
        verify(produtoRepository, times(1)).delete(produto);
    }

    @Test
    @DisplayName("Deve lançar exceção ao deletar produto inexistente")
    void deveLancarExcecaoAoDeletarProdutoInexistente() {
        // Given
        when(produtoRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            produtoService.deletar(999L);
        });
        verify(produtoRepository, never()).delete(any(Produto.class));
    }
}

