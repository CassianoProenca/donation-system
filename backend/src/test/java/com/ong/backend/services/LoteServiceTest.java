package com.ong.backend.services;

import com.ong.backend.dto.lote.LoteRequestDTO;
import com.ong.backend.dto.lote.LoteItemRequestDTO;
import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.models.Lote;
import com.ong.backend.models.LoteItem;
import com.ong.backend.models.Produto;
import com.ong.backend.models.UnidadeMedida;
import com.ong.backend.repositories.LoteItemRepository;
import com.ong.backend.repositories.LoteRepository;
import com.ong.backend.repositories.MovimentacaoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do LoteService")
class LoteServiceTest {

  @Mock
  private LoteRepository loteRepository;

  @Mock
  private LoteItemRepository loteItemRepository;

  @Mock
  private MovimentacaoRepository movimentacaoRepository;

  @Mock
  private ProdutoService produtoService;

  @Mock
  private UsuarioService usuarioService;

  @InjectMocks
  private LoteService loteService;

  private Lote lote;
  private Produto produto;
  private LoteItem loteItem;

  @BeforeEach
  void setUp() {
    produto = new Produto();
    produto.setId(1L);
    produto.setNome("Arroz");

    lote = new Lote();
    lote.setId(1L);
    lote.setQuantidadeInicial(100);
    lote.setQuantidadeAtual(100);
    lote.setDataEntrada(LocalDate.now());
    lote.setUnidadeMedida(UnidadeMedida.UNIDADE);
    lote.setItens(new ArrayList<>());

    loteItem = new LoteItem();
    loteItem.setId(1L);
    loteItem.setLote(lote);
    loteItem.setProduto(produto);
    loteItem.setQuantidade(100);

    lote.getItens().add(loteItem);
  }

  @Test
  @DisplayName("Deve buscar lote por ID com sucesso")
  void deveBuscarLotePorId() {
    // Given
    when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));

    // When
    var resultado = loteService.buscarPorId(1L);

    // Then
    assertNotNull(resultado);
    assertEquals(1L, resultado.id());
    verify(loteRepository, times(1)).findById(1L);
  }

  @Test
  @DisplayName("Deve atualizar quantidade com lock pessimista")
  void deveAtualizarQuantidadeComLock() {
    // Given
    when(loteRepository.findByIdWithLock(1L)).thenReturn(Optional.of(lote));
    when(loteRepository.save(any(Lote.class))).thenReturn(lote);

    // When
    loteService.atualizarQuantidade(1L, -50);

    // Then
    assertEquals(50, lote.getQuantidadeAtual());
    // Verifica que foi usado o método com lock
    verify(loteRepository, times(1)).findByIdWithLock(1L);
    verify(loteRepository, times(1)).save(lote);
  }

  @Test
  @DisplayName("Deve lançar exceção quando quantidade ficar negativa")
  void deveLancarExcecaoQuandoQuantidadeFicarNegativa() {
    // Given
    when(loteRepository.findByIdWithLock(1L)).thenReturn(Optional.of(lote));

    // When & Then
    assertThrows(BusinessException.class, () -> {
      loteService.atualizarQuantidade(1L, -150);
    });
    verify(loteRepository, never()).save(any());
  }

  @Test
  @DisplayName("Deve consumir estoque por produto usando FIFO")
  void deveConsumirEstoquePorProdutoFIFO() {
    // Given
    Lote lote2 = new Lote();
    lote2.setId(2L);
    lote2.setQuantidadeAtual(50);
    lote2.setDataEntrada(LocalDate.now().plusDays(1));
    lote2.setItens(new ArrayList<>());

    LoteItem item2 = new LoteItem();
    item2.setLote(lote2);
    item2.setProduto(produto);
    item2.setQuantidade(50);
    lote2.getItens().add(item2);

    when(loteRepository.findAll()).thenReturn(Arrays.asList(lote, lote2));
    when(loteRepository.findByIdWithLock(1L)).thenReturn(Optional.of(lote));
    when(loteRepository.findByIdWithLock(2L)).thenReturn(Optional.of(lote2));
    when(loteItemRepository.save(any(LoteItem.class))).thenReturn(loteItem);
    when(loteRepository.save(any(Lote.class))).thenReturn(lote);

    // When
    loteService.consumirEstoquePorProduto(1L, 120);

    // Then
    // Deve consumir primeiro do lote mais antigo (lote 1)
    assertEquals(0, lote.getQuantidadeAtual());
    assertEquals(30, lote2.getQuantidadeAtual());
    verify(loteRepository, times(2)).findByIdWithLock(anyLong());
  }

  @Test
  @DisplayName("Deve lançar exceção quando estoque insuficiente")
  void deveLancarExcecaoQuandoEstoqueInsuficiente() {
    // Given
    when(loteRepository.findAll()).thenReturn(Arrays.asList(lote));
    when(loteRepository.findByIdWithLock(1L)).thenReturn(Optional.of(lote));

    // When & Then
    assertThrows(BusinessException.class, () -> {
      loteService.consumirEstoquePorProduto(1L, 200);
    });
  }

  @Test
  @DisplayName("Deve criar lote com sucesso")
  void deveCriarLote() {
    // Given
    LoteItemRequestDTO itemDTO = new LoteItemRequestDTO(
        1L,
        100,
        null,
        null,
        null);

    LoteRequestDTO loteDTO = new LoteRequestDTO(
        Arrays.asList(itemDTO),
        LocalDate.now(),
        UnidadeMedida.UNIDADE,
        "Lote de teste");

    when(produtoService.buscarEntidadePorId(1L)).thenReturn(produto);
    when(loteRepository.save(any(Lote.class))).thenReturn(lote);
    when(usuarioService.buscarEntidadePorEmail(anyString())).thenReturn(null);
    when(movimentacaoRepository.save(any())).thenReturn(null);

    // When
    var resultado = loteService.criar(loteDTO, "test@test.com");

    // Then
    assertNotNull(resultado);
    verify(loteRepository, times(2)).save(any(Lote.class)); // Uma vez para criar, outra para adicionar itens
  }

  @Test
  @DisplayName("Deve lançar exceção ao criar lote com quantidade zero")
  void deveLancarExcecaoAoCriarLoteComQuantidadeZero() {
    // Given
    LoteItemRequestDTO itemDTO = new LoteItemRequestDTO(
        1L,
        0,
        null,
        null,
        null);

    LoteRequestDTO loteDTO = new LoteRequestDTO(
        Arrays.asList(itemDTO),
        LocalDate.now(),
        UnidadeMedida.UNIDADE,
        "Lote inválido");

    // When & Then
    assertThrows(BusinessException.class, () -> {
      loteService.criar(loteDTO, "test@test.com");
    });
    verify(loteRepository, never()).save(any());
  }

  @Test
  @DisplayName("Deve deletar lote sem movimentações")
  void deveDeletarLoteSemMovimentacoes() {
    // Given
    when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
    when(movimentacaoRepository.findByLoteId(1L)).thenReturn(new ArrayList<>());
    doNothing().when(loteRepository).delete(lote);

    // When
    loteService.deletar(1L);

    // Then
    verify(loteRepository, times(1)).delete(lote);
  }

  @Test
  @DisplayName("Deve lançar exceção ao deletar lote com movimentações")
  void deveLancarExcecaoAoDeletarLoteComMovimentacoes() {
    // Given
    com.ong.backend.models.Movimentacao movimentacao = new com.ong.backend.models.Movimentacao();
    when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
    when(movimentacaoRepository.findByLoteId(1L)).thenReturn(Arrays.asList(movimentacao)); // Simula movimentação

    // When & Then
    assertThrows(BusinessException.class, () -> {
      loteService.deletar(1L);
    });
    verify(loteRepository, never()).delete(any(Lote.class));
  }
}
