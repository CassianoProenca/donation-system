package com.ong.backend.services;

import com.ong.backend.dto.movimentacao.MovimentacaoRequestDTO;
import com.ong.backend.dto.movimentacao.MovimentacaoResponseDTO;
import com.ong.backend.dto.movimentacao.MovimentacaoSimplesDTO;
import com.ong.backend.dto.movimentacao.MovimentacaoDetalhesDTO;
import com.ong.backend.dto.movimentacao.MontagemKitRequestDTO;
import com.ong.backend.dto.lote.LoteItemRequestDTO;
import com.ong.backend.dto.lote.LoteRequestDTO;
import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.exceptions.ResourceNotFoundException;
import com.ong.backend.models.ComposicaoProduto;
import com.ong.backend.models.Lote;
import com.ong.backend.models.Movimentacao;
import com.ong.backend.models.Produto;
import com.ong.backend.models.TipoMovimentacao;
import com.ong.backend.models.Usuario;
import com.ong.backend.repositories.MovimentacaoRepository;
import com.ong.backend.specifications.MovimentacaoSpecs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MovimentacaoService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final LoteService loteService;
    private final UsuarioService usuarioService;
    private final ProdutoService produtoService;

    @Transactional(readOnly = true)
    public List<MovimentacaoResponseDTO> listarTodas() {
        return movimentacaoRepository.findAll()
                .stream()
                .map(MovimentacaoResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<MovimentacaoResponseDTO> listarComFiltros(
            String tipo,
            Long loteId,
            Long usuarioId,
            String dataInicioStr,
            String dataFimStr,
            Pageable pageable) {
        LocalDateTime inicio = (dataInicioStr != null && !dataInicioStr.isEmpty()) ? LocalDateTime.parse(dataInicioStr)
                : null;
        LocalDateTime fim = (dataFimStr != null && !dataFimStr.isEmpty()) ? LocalDateTime.parse(dataFimStr) : null;

        Specification<Movimentacao> spec = MovimentacaoSpecs.comFiltros(tipo, loteId, usuarioId, inicio, fim);

        return movimentacaoRepository.findAll(spec, pageable)
                .map(MovimentacaoResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoSimplesDTO> listarTodasSimples() {
        return movimentacaoRepository.findAll()
                .stream()
                .map(MovimentacaoSimplesDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public MovimentacaoResponseDTO buscarPorId(Long id) {
        Movimentacao movimentacao = movimentacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimentação", "id", id));
        return new MovimentacaoResponseDTO(movimentacao);
    }

    @Transactional(readOnly = true)
    public MovimentacaoDetalhesDTO buscarDetalhesPorId(Long id) {
        Movimentacao movimentacao = movimentacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimentação", "id", id));

        int quantidadeAtual = movimentacao.getLote().getQuantidadeAtual();
        int quantidadeAnterior = calcularQuantidadeAnterior(movimentacao, quantidadeAtual);

        return new MovimentacaoDetalhesDTO(movimentacao, quantidadeAnterior, quantidadeAtual);
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoSimplesDTO> buscarPorLote(Long loteId) {
        return movimentacaoRepository.findByLoteIdOrderByDataHoraDesc(loteId)
                .stream()
                .map(MovimentacaoSimplesDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoSimplesDTO> buscarPorUsuario(Long usuarioId) {
        return movimentacaoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(MovimentacaoSimplesDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoSimplesDTO> buscarPorTipo(TipoMovimentacao tipo) {
        return movimentacaoRepository.findByTipo(tipo)
                .stream()
                .map(MovimentacaoSimplesDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoSimplesDTO> buscarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        return movimentacaoRepository.findByDataHoraBetween(inicio, fim)
                .stream()
                .map(MovimentacaoSimplesDTO::new)
                .toList();
    }

    @Transactional
    public MovimentacaoResponseDTO criar(MovimentacaoRequestDTO dto, String emailUsuarioAutenticado) {
        log.info("Criando movimentação: tipo={}, loteId={}, quantidade={}",
                dto.tipo(), dto.loteId(), dto.quantidade());

        Lote lote = loteService.buscarEntidadePorId(dto.loteId());

        Usuario usuario;
        if (dto.usuarioId() != null) {
            usuario = usuarioService.buscarEntidadePorId(dto.usuarioId());
        } else {
            usuario = usuarioService.buscarEntidadePorEmail(emailUsuarioAutenticado);
        }

        int delta = calcularDelta(dto.tipo(), dto.quantidade());

        loteService.atualizarQuantidade(dto.loteId(), delta);

        Movimentacao movimentacao = new Movimentacao();
        movimentacao.setLote(lote);
        movimentacao.setUsuario(usuario);
        movimentacao.setTipo(dto.tipo());
        movimentacao.setQuantidade(dto.quantidade());
        movimentacao.setDataHora(LocalDateTime.now());

        movimentacao = movimentacaoRepository.save(movimentacao);
        log.info("Movimentação criada com sucesso. ID: {}", movimentacao.getId());
        return new MovimentacaoResponseDTO(movimentacao);
    }

    @Transactional
    public void deletar(Long id) {
        Movimentacao movimentacao = movimentacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimentação", "id", id));

        movimentacaoRepository.delete(movimentacao);
    }

    private int calcularDelta(TipoMovimentacao tipo, int quantidade) {
        return switch (tipo) {
            case ENTRADA, AJUSTE_GANHO -> quantidade;
            case SAIDA, AJUSTE_PERDA -> -quantidade;
        };
    }

    private int calcularQuantidadeAnterior(Movimentacao movimentacao, int quantidadeAtual) {
        int delta = calcularDelta(movimentacao.getTipo(), movimentacao.getQuantidade());
        return quantidadeAtual - delta;
    }

    @Transactional
    public MovimentacaoResponseDTO montarKit(MontagemKitRequestDTO dto, String emailUsuario) {
        log.info("Montando kit: produtoId={}, quantidade={}, usuario={}",
                dto.produtoKitId(), dto.quantidade(), emailUsuario);

        Produto kit = produtoService.buscarEntidadePorId(dto.produtoKitId());

        if (!kit.isKit()) {
            log.warn("Tentativa de montar kit com produto que não é kit. ProdutoId: {}", dto.produtoKitId());
            throw new BusinessException("O produto informado não é um Kit (item composto).");
        }

        if (kit.getComponentes().isEmpty()) {
            log.warn("Tentativa de montar kit sem componentes. ProdutoId: {}", dto.produtoKitId());
            throw new BusinessException("Este kit não possui componentes definidos na sua 'receita'.");
        }

        log.debug("Consumindo estoque de {} componentes para montar kit", kit.getComponentes().size());
        for (ComposicaoProduto itemReceita : kit.getComponentes()) {
            int qtdTotalNecessaria = itemReceita.getQuantidade() * dto.quantidade();
            log.debug("Consumindo {} unidades do componente {}", qtdTotalNecessaria,
                    itemReceita.getComponente().getId());
            loteService.consumirEstoquePorProduto(itemReceita.getComponente().getId(), qtdTotalNecessaria);
        }
        LoteItemRequestDTO itemKit = new LoteItemRequestDTO(
                kit.getId(),
                dto.quantidade(),
                null, // validade
                null, // tamanho
                null // voltagem
        );

        LoteRequestDTO novoLoteDto = new LoteRequestDTO(
                Collections.singletonList(itemKit),
                java.time.LocalDate.now(),
                com.ong.backend.models.UnidadeMedida.UNIDADE,
                "Montagem automática de Kit: " + kit.getNome());

        var loteCriadoResponse = loteService.criar(novoLoteDto, emailUsuario);

        List<MovimentacaoSimplesDTO> movimentacoes = buscarPorLote(loteCriadoResponse.id());

        if (movimentacoes.isEmpty()) {
            throw new BusinessException("Erro interno: Movimentação não encontrada após criação do lote.");
        }

        Long ultimaMovimentacaoId = movimentacoes.get(0).id();
        return buscarPorId(ultimaMovimentacaoId);
    }
}
