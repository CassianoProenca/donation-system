package com.ong.backend.services;

import com.ong.backend.dto.dashboard.DashboardMetricsDTO;
import com.ong.backend.models.*;
import com.ong.backend.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do DashboardService")
class DashboardServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private LoteRepository loteRepository;

    @Mock
    private LoteItemRepository loteItemRepository;

    @Mock
    private MovimentacaoRepository movimentacaoRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private Categoria categoria;
    private Produto produto;
    private Lote lote;
    private LoteItem loteItem;
    private Movimentacao movimentacao;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        categoria = new Categoria();
        categoria.setId(1L);
        categoria.setNome("Alimentos");

        produto = new Produto();
        produto.setId(1L);
        produto.setNome("Arroz");
        produto.setCategoria(categoria);

        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("Test User");
        usuario.setEmail("test@test.com");

        loteItem = new LoteItem();
        loteItem.setId(1L);
        loteItem.setProduto(produto);
        loteItem.setQuantidade(10);
        loteItem.setDataValidade(LocalDate.now().plusDays(10));

        lote = new Lote();
        lote.setId(1L);
        lote.setQuantidadeInicial(100);
        lote.setQuantidadeAtual(50);
        lote.setDataEntrada(LocalDate.now());
        lote.setItens(new ArrayList<>(Arrays.asList(loteItem)));

        movimentacao = new Movimentacao();
        movimentacao.setId(1L);
        movimentacao.setLote(lote);
        movimentacao.setUsuario(usuario);
        movimentacao.setTipo(TipoMovimentacao.SAIDA);
        movimentacao.setQuantidade(10);
        movimentacao.setDataHora(LocalDateTime.now());
    }

    @Test
    @DisplayName("Deve obter métricas do dashboard com sucesso")
    void deveObterMetricasComSucesso() {
        // Arrange
        when(categoriaRepository.count()).thenReturn(5L);
        when(produtoRepository.count()).thenReturn(20L);
        when(loteRepository.count()).thenReturn(15L);
        when(loteRepository.findAll()).thenReturn(Arrays.asList(lote));
        when(movimentacaoRepository.findByDataHoraBetween(any(), any()))
                .thenReturn(Arrays.asList(movimentacao));
        when(movimentacaoRepository.findAll()).thenReturn(Arrays.asList(movimentacao));

        // Act
        DashboardMetricsDTO result = dashboardService.obterMetricas(null, null);

        // Assert
        assertNotNull(result);
        assertEquals(5L, result.totalCategorias());
        assertEquals(20L, result.totalProdutos());
        assertEquals(15L, result.totalLotes());
        assertEquals(50L, result.estoqueTotal());
        assertNotNull(result.alertasCriticos());
        assertNotNull(result.evolucaoEstoque());
        assertNotNull(result.top5ProdutosMaisDistribuidos());
        assertNotNull(result.ultimasMovimentacoes());
        assertNotNull(result.movimentacoesPorDia());
        assertNotNull(result.movimentacoesPorTipo());

        verify(categoriaRepository, times(1)).count();
        verify(produtoRepository, times(1)).count();
        verify(loteRepository, times(1)).count();
    }

    @Test
    @DisplayName("Deve calcular estoque total corretamente")
    void deveCalcularEstoqueTotalCorretamente() {
        // Arrange
        Lote lote1 = new Lote();
        lote1.setQuantidadeAtual(100);
        Lote lote2 = new Lote();
        lote2.setQuantidadeAtual(50);
        Lote lote3 = new Lote();
        lote3.setQuantidadeAtual(null);

        when(categoriaRepository.count()).thenReturn(1L);
        when(produtoRepository.count()).thenReturn(1L);
        when(loteRepository.count()).thenReturn(3L);
        when(loteRepository.findAll()).thenReturn(Arrays.asList(lote1, lote2, lote3));
        when(movimentacaoRepository.findByDataHoraBetween(any(), any()))
                .thenReturn(new ArrayList<>());
        when(movimentacaoRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        DashboardMetricsDTO result = dashboardService.obterMetricas(null, null);

        // Assert
        assertEquals(150L, result.estoqueTotal());
    }

    @Test
    @DisplayName("Deve identificar lotes vencendo em 30 dias")
    void deveIdentificarLotesVencendo() {
        // Arrange
        LoteItem itemVencendo = new LoteItem();
        itemVencendo.setDataValidade(LocalDate.now().plusDays(25));
        itemVencendo.setQuantidade(10);

        Lote loteVencendo = new Lote();
        loteVencendo.setId(1L);
        loteVencendo.setQuantidadeAtual(10);
        loteVencendo.setItens(new ArrayList<>(Arrays.asList(itemVencendo)));

        when(categoriaRepository.count()).thenReturn(1L);
        when(produtoRepository.count()).thenReturn(1L);
        when(loteRepository.count()).thenReturn(1L);
        when(loteRepository.findAll()).thenReturn(Arrays.asList(loteVencendo));
        when(movimentacaoRepository.findByDataHoraBetween(any(), any()))
                .thenReturn(new ArrayList<>());
        when(movimentacaoRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        DashboardMetricsDTO result = dashboardService.obterMetricas(null, null);

        // Assert
        assertTrue(result.alertasCriticos().lotesVencendo() > 0);
    }

    @Test
    @DisplayName("Deve identificar lotes sem estoque")
    void deveIdentificarLotesSemEstoque() {
        // Arrange
        Lote loteSemEstoque = new Lote();
        loteSemEstoque.setId(1L);
        loteSemEstoque.setQuantidadeAtual(0);

        when(categoriaRepository.count()).thenReturn(1L);
        when(produtoRepository.count()).thenReturn(1L);
        when(loteRepository.count()).thenReturn(1L);
        when(loteRepository.findAll()).thenReturn(Arrays.asList(loteSemEstoque));
        when(movimentacaoRepository.findByDataHoraBetween(any(), any()))
                .thenReturn(new ArrayList<>());
        when(movimentacaoRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        DashboardMetricsDTO result = dashboardService.obterMetricas(null, null);

        // Assert
        assertEquals(1L, result.alertasCriticos().lotesSemEstoque());
    }

    @Test
    @DisplayName("Deve retornar movimentações do período corretamente")
    void deveRetornarMovimentacoesNoPeriodo() {
        // Arrange
        Movimentacao movNoPeriodo = new Movimentacao();
        movNoPeriodo.setDataHora(LocalDateTime.now());
        movNoPeriodo.setTipo(TipoMovimentacao.ENTRADA);
        movNoPeriodo.setQuantidade(10);

        when(categoriaRepository.count()).thenReturn(1L);
        when(produtoRepository.count()).thenReturn(1L);
        when(loteRepository.count()).thenReturn(1L);
        when(loteRepository.findAll()).thenReturn(new ArrayList<>());
        when(movimentacaoRepository.findByDataHoraBetween(any(), any()))
                .thenReturn(Arrays.asList(movNoPeriodo, movNoPeriodo, movNoPeriodo));
        when(movimentacaoRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        DashboardMetricsDTO result = dashboardService.obterMetricas(null, null);

        // Assert
        assertEquals(3, result.movimentacoesHoje());
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando não há dados")
    void deveRetornarListaVaziaQuandoNaoHaDados() {
        // Arrange
        LocalDate inicio = LocalDate.now().minusDays(7);
        LocalDate fim = LocalDate.now();

        when(categoriaRepository.count()).thenReturn(0L);
        when(produtoRepository.count()).thenReturn(0L);
        when(loteRepository.count()).thenReturn(0L);
        when(loteRepository.findAll()).thenReturn(new ArrayList<>());
        when(movimentacaoRepository.findByDataHoraBetween(any(), any()))
                .thenReturn(new ArrayList<>());
        when(movimentacaoRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        DashboardMetricsDTO result = dashboardService.obterMetricas(inicio, fim);

        // Assert
        assertNotNull(result);
        assertEquals(0L, result.totalCategorias());
        assertEquals(0L, result.totalProdutos());
        assertEquals(0L, result.totalLotes());
        assertEquals(0L, result.estoqueTotal());
        assertEquals(0, result.movimentacoesHoje());

        // evolucaoEstoque retorna a quantidade de dias do período
        assertEquals(8, result.evolucaoEstoque().size()); // 7 dias atrás + hoje = 8 dias
        assertTrue(result.top5ProdutosMaisDistribuidos().isEmpty());
        assertTrue(result.ultimasMovimentacoes().isEmpty());
    }
}
