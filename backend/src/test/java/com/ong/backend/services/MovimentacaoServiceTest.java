package com.ong.backend.services;

import com.ong.backend.dto.movimentacao.MovimentacaoRequestDTO;
import com.ong.backend.dto.movimentacao.MontagemKitRequestDTO;
import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.exceptions.ResourceNotFoundException;
import com.ong.backend.models.*;
import com.ong.backend.repositories.MovimentacaoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do MovimentacaoService")
class MovimentacaoServiceTest {

  @Mock
  private MovimentacaoRepository movimentacaoRepository;

  @Mock
  private LoteService loteService;

  @Mock
  private UsuarioService usuarioService;

  @Mock
  private ProdutoService produtoService;

  @InjectMocks
  private MovimentacaoService movimentacaoService;

  private Movimentacao movimentacao;
  private Lote lote;
  private Usuario usuario;
  private Produto produto;

  @BeforeEach
  void setUp() {
    usuario = new Usuario();
    usuario.setId(1L);
    usuario.setEmail("test@test.com");
    usuario.setNome("Teste Usuario");

    produto = new Produto();
    produto.setId(1L);
    produto.setNome("Arroz");

    lote = new Lote();
    lote.setId(1L);
    lote.setQuantidadeAtual(100);

    movimentacao = new Movimentacao();
    movimentacao.setId(1L);
    movimentacao.setLote(lote);
    movimentacao.setUsuario(usuario);
    movimentacao.setTipo(TipoMovimentacao.ENTRADA);
    movimentacao.setQuantidade(50);
    movimentacao.setDataHora(LocalDateTime.now());
  }

  @Test
  @DisplayName("Deve criar movimentação de entrada com sucesso")
  void deveCriarMovimentacaoEntrada() {
    // Given
    MovimentacaoRequestDTO dto = new MovimentacaoRequestDTO(
        1L,
        null,
        TipoMovimentacao.ENTRADA,
        50);

    when(loteService.buscarEntidadePorId(1L)).thenReturn(lote);
    when(usuarioService.buscarEntidadePorEmail("test@test.com")).thenReturn(usuario);
    doNothing().when(loteService).atualizarQuantidade(1L, 50);
    when(movimentacaoRepository.save(any(Movimentacao.class))).thenReturn(movimentacao);

    // When
    var resultado = movimentacaoService.criar(dto, "test@test.com");

    // Then
    assertNotNull(resultado);
    assertEquals(1L, resultado.id());
    verify(loteService, times(1)).atualizarQuantidade(1L, 50);
    verify(movimentacaoRepository, times(1)).save(any(Movimentacao.class));
  }

  @Test
  @DisplayName("Deve criar movimentação de saída com delta negativo")
  void deveCriarMovimentacaoSaida() {
    // Given
    MovimentacaoRequestDTO dto = new MovimentacaoRequestDTO(
        1L,
        null,
        TipoMovimentacao.SAIDA,
        30);

    when(loteService.buscarEntidadePorId(1L)).thenReturn(lote);
    when(usuarioService.buscarEntidadePorEmail("test@test.com")).thenReturn(usuario);
    doNothing().when(loteService).atualizarQuantidade(1L, -30);
    when(movimentacaoRepository.save(any(Movimentacao.class))).thenReturn(movimentacao);

    // When
    var resultado = movimentacaoService.criar(dto, "test@test.com");

    // Then
    assertNotNull(resultado);
    verify(loteService, times(1)).atualizarQuantidade(1L, -30);
  }

  @Test
  @DisplayName("Deve buscar movimentação por ID")
  void deveBuscarMovimentacaoPorId() {
    // Given
    when(movimentacaoRepository.findById(1L)).thenReturn(Optional.of(movimentacao));

    // When
    var resultado = movimentacaoService.buscarPorId(1L);

    // Then
    assertNotNull(resultado);
    assertEquals(1L, resultado.id());
    verify(movimentacaoRepository, times(1)).findById(1L);
  }

  @Test
  @DisplayName("Deve lançar exceção quando movimentação não encontrada")
  void deveLancarExcecaoQuandoMovimentacaoNaoEncontrada() {
    // Given
    when(movimentacaoRepository.findById(999L)).thenReturn(Optional.empty());

    // When & Then
    assertThrows(ResourceNotFoundException.class, () -> {
      movimentacaoService.buscarPorId(999L);
    });
  }

  @Test
  @DisplayName("Deve montar kit consumindo componentes do estoque")
  void deveMontarKitConsumindoComponentes() {
    // Given
    Produto kit = new Produto();
    kit.setId(10L);
    kit.setNome("Kit Alimentação");
    kit.setKit(true);

    Produto componente1 = new Produto();
    componente1.setId(1L);
    componente1.setNome("Arroz");

    Produto componente2 = new Produto();
    componente2.setId(2L);
    componente2.setNome("Feijão");

    ComposicaoProduto comp1 = new ComposicaoProduto();
    comp1.setComponente(componente1);
    comp1.setQuantidade(2);

    ComposicaoProduto comp2 = new ComposicaoProduto();
    comp2.setComponente(componente2);
    comp2.setQuantidade(1);

    kit.setComponentes(Arrays.asList(comp1, comp2));

    MontagemKitRequestDTO dto = new MontagemKitRequestDTO(10L, 5);

    when(produtoService.buscarEntidadePorId(10L)).thenReturn(kit);
    doNothing().when(loteService).consumirEstoquePorProduto(1L, 10);
    doNothing().when(loteService).consumirEstoquePorProduto(2L, 5);

    com.ong.backend.dto.lote.LoteResponseDTO loteResponse = new com.ong.backend.dto.lote.LoteResponseDTO(
        100L,
        new ArrayList<>(),
        5,
        5,
        java.time.LocalDate.now(),
        com.ong.backend.models.UnidadeMedida.UNIDADE,
        "Montagem automática de Kit: Kit Alimentação",
        "2100000000010");
    when(loteService.criar(any(), anyString())).thenReturn(loteResponse);

    Movimentacao movimentacaoKit = new Movimentacao();
    movimentacaoKit.setId(200L);
    movimentacaoKit.setLote(lote);
    movimentacaoKit.setUsuario(usuario);
    movimentacaoKit.setTipo(TipoMovimentacao.ENTRADA);
    movimentacaoKit.setQuantidade(5);
    movimentacaoKit.setDataHora(LocalDateTime.now());

    when(movimentacaoRepository.findByLoteIdOrderByDataHoraDesc(100L))
        .thenReturn(Arrays.asList(movimentacaoKit));
    when(movimentacaoRepository.findById(200L))
        .thenReturn(Optional.of(movimentacaoKit));

    // When
    var resultado = movimentacaoService.montarKit(dto, "test@test.com");

    // Then
    assertNotNull(resultado);
    verify(loteService, times(1)).consumirEstoquePorProduto(1L, 10);
    verify(loteService, times(1)).consumirEstoquePorProduto(2L, 5);
  }

  @Test
  @DisplayName("Deve lançar exceção ao montar kit com produto que não é kit")
  void deveLancarExcecaoAoMontarKitComProdutoNaoKit() {
    // Given
    Produto produtoNormal = new Produto();
    produtoNormal.setId(1L);
    produtoNormal.setKit(false);

    MontagemKitRequestDTO dto = new MontagemKitRequestDTO(1L, 5);

    when(produtoService.buscarEntidadePorId(1L)).thenReturn(produtoNormal);

    // When & Then
    assertThrows(BusinessException.class, () -> {
      movimentacaoService.montarKit(dto, "test@test.com");
    });
    verify(loteService, never()).consumirEstoquePorProduto(anyLong(), anyInt());
  }

  @Test
  @DisplayName("Deve lançar exceção ao montar kit sem componentes")
  void deveLancarExcecaoAoMontarKitSemComponentes() {
    // Given
    Produto kit = new Produto();
    kit.setId(10L);
    kit.setKit(true);
    kit.setComponentes(new ArrayList<>());

    MontagemKitRequestDTO dto = new MontagemKitRequestDTO(10L, 5);

    when(produtoService.buscarEntidadePorId(10L)).thenReturn(kit);

    // When & Then
    assertThrows(BusinessException.class, () -> {
      movimentacaoService.montarKit(dto, "test@test.com");
    });
  }

  @Test
  @DisplayName("Deve calcular delta correto para diferentes tipos de movimentação")
  void deveCalcularDeltaCorreto() {
    // Given
    MovimentacaoRequestDTO entrada = new MovimentacaoRequestDTO(
        1L, null, TipoMovimentacao.ENTRADA, 50);
    MovimentacaoRequestDTO saida = new MovimentacaoRequestDTO(
        1L, null, TipoMovimentacao.SAIDA, 30);
    MovimentacaoRequestDTO ajusteGanho = new MovimentacaoRequestDTO(
        1L, null, TipoMovimentacao.AJUSTE_GANHO, 10);
    MovimentacaoRequestDTO ajustePerda = new MovimentacaoRequestDTO(
        1L, null, TipoMovimentacao.AJUSTE_PERDA, 5);

    when(loteService.buscarEntidadePorId(1L)).thenReturn(lote);
    when(usuarioService.buscarEntidadePorEmail(anyString())).thenReturn(usuario);
    when(movimentacaoRepository.save(any(Movimentacao.class))).thenReturn(movimentacao);

    // When
    movimentacaoService.criar(entrada, "test@test.com");
    movimentacaoService.criar(saida, "test@test.com");
    movimentacaoService.criar(ajusteGanho, "test@test.com");
    movimentacaoService.criar(ajustePerda, "test@test.com");

    // Then
    verify(loteService, times(1)).atualizarQuantidade(1L, 50); // ENTRADA
    verify(loteService, times(1)).atualizarQuantidade(1L, -30); // SAIDA
    verify(loteService, times(1)).atualizarQuantidade(1L, 10); // AJUSTE_GANHO
    verify(loteService, times(1)).atualizarQuantidade(1L, -5); // AJUSTE_PERDA
  }
}
