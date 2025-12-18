package com.ong.backend.services;

import com.ong.backend.dto.lote.LoteRequestDTO;
import com.ong.backend.dto.lote.LoteResponseDTO;
import com.ong.backend.dto.lote.LoteSimplesDTO;
import com.ong.backend.dto.lote.LoteDetalhesDTO;
import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.exceptions.ResourceNotFoundException;
import com.ong.backend.models.Lote;
import com.ong.backend.models.LoteItem;
import com.ong.backend.models.Produto;
import com.ong.backend.models.Usuario;
import com.ong.backend.models.Movimentacao;
import com.ong.backend.models.TipoMovimentacao;
import com.ong.backend.repositories.LoteRepository;
import com.ong.backend.repositories.LoteItemRepository;
import com.ong.backend.repositories.MovimentacaoRepository;
import com.ong.backend.specifications.LoteSpecs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoteService {

    private final LoteRepository loteRepository;
    private final LoteItemRepository loteItemRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final ProdutoService produtoService;
    private final UsuarioService usuarioService;

    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarTodos() {
        return loteRepository.findAll()
                .stream()
                .map(LoteResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<LoteResponseDTO> listarComFiltros(
            Long produtoId,
            String dataEntradaInicio,
            String dataEntradaFim,
            String dataValidadeInicio,
            String dataValidadeFim,
            Boolean comEstoque,
            String busca,
            Pageable pageable) {

        LocalDate inicio = (dataEntradaInicio != null && !dataEntradaInicio.isEmpty())
                ? LocalDate.parse(dataEntradaInicio)
                : null;
        LocalDate fim = (dataEntradaFim != null && !dataEntradaFim.isEmpty()) ? LocalDate.parse(dataEntradaFim) : null;
        LocalDate validadeInicio = (dataValidadeInicio != null && !dataValidadeInicio.isEmpty())
                ? LocalDate.parse(dataValidadeInicio)
                : null;
        LocalDate validadeFim = (dataValidadeFim != null && !dataValidadeFim.isEmpty())
                ? LocalDate.parse(dataValidadeFim)
                : null;

        return loteRepository.findAll(
                LoteSpecs.comFiltros(produtoId, inicio, fim, validadeInicio, validadeFim, comEstoque, busca),
                pageable).map(LoteResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarTodosSemPaginacao() {
        return loteRepository.findAll().stream().map(LoteResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<LoteSimplesDTO> listarTodosSimples() {
        return loteRepository.findAll()
                .stream()
                .map(LoteSimplesDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public LoteResponseDTO buscarPorId(Long id) {
        Lote lote = loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote", "id", id));
        return new LoteResponseDTO(lote);
    }

    @Transactional(readOnly = true)
    public LoteDetalhesDTO buscarDetalhesPorId(Long id) {
        Lote lote = loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote", "id", id));

        Integer totalMovimentacoes = movimentacaoRepository.findByLoteId(id).size();

        return new LoteDetalhesDTO(lote, totalMovimentacoes);
    }

    @Transactional(readOnly = true)
    public List<LoteResponseDTO> buscarPorProduto(Long produtoId) {
        return loteRepository.findAll()
                .stream()
                .filter(l -> l.getItens().stream().anyMatch(item -> item.getProduto().getId().equals(produtoId)))
                .map(LoteResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoteSimplesDTO> buscarProximosAoVencimento(int dias) {
        LocalDate dataLimite = LocalDate.now().plusDays(dias);
        return loteRepository.findAll()
                .stream()
                .filter(lote -> lote.getQuantidadeAtual() > 0)
                .filter(lote -> lote.getItens().stream()
                        .anyMatch(item -> item.getDataValidade() != null &&
                                item.getDataValidade().isBefore(dataLimite)))
                .map(LoteSimplesDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoteSimplesDTO> buscarComEstoque() {
        return loteRepository.findByQuantidadeAtualGreaterThan(0)
                .stream()
                .map(LoteSimplesDTO::new)
                .toList();
    }

    @Transactional
    public LoteResponseDTO criar(LoteRequestDTO dto, String emailUsuarioAutenticado) {
        int quantidadeTotal = dto.itens().stream()
                .mapToInt(item -> item.quantidade())
                .sum();

        if (quantidadeTotal <= 0) {
            throw new BusinessException("Quantidade total deve ser maior que zero");
        }

        Lote lote = new Lote();
        lote.setQuantidadeInicial(quantidadeTotal);
        lote.setQuantidadeAtual(quantidadeTotal);
        lote.setDataEntrada(dto.dataEntrada());
        lote.setUnidadeMedida(dto.unidadeMedida());
        lote.setObservacoes(dto.observacoes());

        lote = loteRepository.save(lote);

        Lote finalLote = lote;
        dto.itens().forEach(itemDto -> {
            Produto produto = produtoService.buscarEntidadePorId(itemDto.produtoId());

            LoteItem item = new LoteItem();
            item.setLote(finalLote);
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());
            item.setDataValidade(itemDto.dataValidade());
            item.setTamanho(itemDto.tamanho());
            item.setVoltagem(itemDto.voltagem());

            finalLote.getItens().add(item);
        });

        lote = loteRepository.save(lote);

        criarMovimentacaoEntrada(lote, emailUsuarioAutenticado);

        return new LoteResponseDTO(lote);
    }

    private void criarMovimentacaoEntrada(Lote lote, String emailUsuarioAutenticado) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(emailUsuarioAutenticado);

        Movimentacao movimentacao = new Movimentacao();
        movimentacao.setLote(lote);
        movimentacao.setUsuario(usuario);
        movimentacao.setTipo(TipoMovimentacao.ENTRADA);
        movimentacao.setQuantidade(lote.getQuantidadeInicial());
        movimentacao.setDataHora(java.time.LocalDateTime.now());

        movimentacaoRepository.save(movimentacao);
    }

    @Transactional
    public LoteResponseDTO atualizar(Long id, LoteRequestDTO dto) {
        Lote lote = loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote", "id", id));

        if (!movimentacaoRepository.findByLoteId(id).isEmpty()) {
            throw new BusinessException("Não é possível atualizar lote com movimentações. Crie um novo lote.");
        }

        int quantidadeTotal = dto.itens().stream()
                .mapToInt(item -> item.quantidade())
                .sum();

        lote.setQuantidadeInicial(quantidadeTotal);
        lote.setQuantidadeAtual(quantidadeTotal);
        lote.setDataEntrada(dto.dataEntrada());
        lote.setUnidadeMedida(dto.unidadeMedida());
        lote.setObservacoes(dto.observacoes());

        lote.getItens().clear();

        final Lote finalLote = lote;
        dto.itens().forEach(itemDto -> {
            Produto produto = produtoService.buscarEntidadePorId(itemDto.produtoId());

            LoteItem item = new LoteItem();
            item.setLote(finalLote);
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());
            item.setDataValidade(itemDto.dataValidade());
            item.setTamanho(itemDto.tamanho());
            item.setVoltagem(itemDto.voltagem());

            finalLote.getItens().add(item);
        });

        lote = loteRepository.save(lote);
        return new LoteResponseDTO(lote);
    }

    @Transactional
    public void deletar(Long id) {
        Lote lote = loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote", "id", id));

        if (!movimentacaoRepository.findByLoteId(id).isEmpty()) {
            throw new BusinessException("Não é possível deletar um lote que possui movimentações");
        }

        loteRepository.delete(lote);
    }

    @Transactional
    public void atualizarQuantidade(Long loteId, int delta) {
        Lote lote = loteRepository.findByIdWithLock(loteId)
                .orElseThrow(() -> new ResourceNotFoundException("Lote", "id", loteId));

        int quantidadeAnterior = lote.getQuantidadeAtual();
        int novaQuantidade = quantidadeAnterior + delta;

        if (novaQuantidade < 0) {
            log.warn("Tentativa de atualizar quantidade do lote {} para valor negativo. Disponível: {}, Delta: {}",
                    loteId, quantidadeAnterior, delta);
            throw new BusinessException("Quantidade insuficiente em estoque. Disponível: " + quantidadeAnterior);
        }

        lote.setQuantidadeAtual(novaQuantidade);
        loteRepository.save(lote);
        log.debug("Quantidade do lote {} atualizada: {} -> {}", loteId, quantidadeAnterior, novaQuantidade);
    }

    @Transactional(readOnly = true)
    public Lote buscarEntidadePorId(Long id) {
        return loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote", "id", id));
    }

    @Transactional
    public void consumirEstoquePorProduto(Long produtoId, int quantidadeNecessaria) {
        log.info("Consumindo estoque do produto {}: quantidade necessária = {}", produtoId, quantidadeNecessaria);

        List<Lote> lotesComProduto = loteRepository.findAll().stream()
                .filter(l -> l.getItens().stream()
                        .anyMatch(i -> i.getProduto().getId().equals(produtoId) && i.getQuantidade() > 0))
                .sorted((l1, l2) -> l1.getDataEntrada().compareTo(l2.getDataEntrada()))
                .toList();

        int qtdRestanteParaBaixar = quantidadeNecessaria;

        for (Lote lote : lotesComProduto) {
            if (qtdRestanteParaBaixar <= 0)
                break;

            Lote loteComLock = loteRepository.findByIdWithLock(lote.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lote", "id", lote.getId()));

            LoteItem item = loteComLock.getItens().stream()
                    .filter(i -> i.getProduto().getId().equals(produtoId))
                    .findFirst()
                    .orElseThrow();

            int disponivelNoLote = item.getQuantidade();

            if (disponivelNoLote >= qtdRestanteParaBaixar) {
                item.setQuantidade(disponivelNoLote - qtdRestanteParaBaixar);
                loteComLock.setQuantidadeAtual(loteComLock.getQuantidadeAtual() - qtdRestanteParaBaixar);
                qtdRestanteParaBaixar = 0;
            } else {
                item.setQuantidade(0);
                loteComLock.setQuantidadeAtual(loteComLock.getQuantidadeAtual() - disponivelNoLote);
                qtdRestanteParaBaixar -= disponivelNoLote;
            }

            loteItemRepository.save(item);
            loteRepository.save(loteComLock);
            log.debug("Consumido {} do lote {} para produto {}", disponivelNoLote - item.getQuantidade(),
                    loteComLock.getId(), produtoId);
        }

        if (qtdRestanteParaBaixar > 0) {
            log.error("Estoque insuficiente para produto {}. Necessário: {}, Faltam: {}",
                    produtoId, quantidadeNecessaria, qtdRestanteParaBaixar);
            throw new BusinessException(
                    "Estoque insuficiente para o produto ID: " + produtoId + ". Faltam: " + qtdRestanteParaBaixar);
        }

        log.info("Estoque consumido com sucesso para produto {}", produtoId);
    }
}
