package com.ong.backend.services;

import com.ong.backend.dto.lote.LoteRequestDTO;
import com.ong.backend.dto.lote.LoteResponseDTO;
import com.ong.backend.dto.lote.LoteSimplesDTO;
import com.ong.backend.dto.lote.LoteDetalhesDTO;
import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.exceptions.ResourceNotFoundException;
import com.ong.backend.models.Lote;
import com.ong.backend.models.Produto;
import com.ong.backend.repositories.LoteRepository;
import com.ong.backend.repositories.MovimentacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoteService {

    private final LoteRepository loteRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final ProdutoService produtoService;

    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarTodos() {
        return loteRepository.findAll()
                .stream()
                .map(LoteResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarComFiltros(Long produtoId, String dataEntradaInicio, String dataEntradaFim, Boolean comEstoque) {
        List<Lote> lotes = loteRepository.findAll();
        
        return lotes.stream()
                .filter(l -> produtoId == null || l.getProduto().getId().equals(produtoId))
                .filter(l -> dataEntradaInicio == null || dataEntradaInicio.trim().isEmpty() || !l.getDataEntrada().isBefore(LocalDate.parse(dataEntradaInicio)))
                .filter(l -> dataEntradaFim == null || dataEntradaFim.trim().isEmpty() || !l.getDataEntrada().isAfter(LocalDate.parse(dataEntradaFim)))
                .filter(l -> comEstoque == null || !comEstoque || l.getQuantidadeAtual() > 0)
                .map(LoteResponseDTO::new)
                .collect(Collectors.toList());
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
        return loteRepository.findByProdutoId(produtoId)
                .stream()
                .map(LoteResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoteSimplesDTO> buscarProximosAoVencimento(int dias) {
        LocalDate dataLimite = LocalDate.now().plusDays(dias);
        return loteRepository.findByDataValidadeBefore(dataLimite)
                .stream()
                .filter(lote -> lote.getQuantidadeAtual() > 0)
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
    public LoteResponseDTO criar(LoteRequestDTO dto) {
        Produto produto = produtoService.buscarEntidadePorId(dto.produtoId());

        if (dto.quantidadeInicial() <= 0) {
            throw new BusinessException("Quantidade inicial deve ser maior que zero");
        }

        Lote lote = new Lote();
        lote.setProduto(produto);
        lote.setQuantidadeInicial(dto.quantidadeInicial());
        lote.setQuantidadeAtual(dto.quantidadeInicial());
        lote.setDataEntrada(dto.dataEntrada());
        lote.setUnidadeMedida(dto.unidadeMedida());
        lote.setDataValidade(dto.dataValidade());
        lote.setTamanho(dto.tamanho());
        lote.setVoltagem(dto.voltagem());
        lote.setObservacoes(dto.observacoes());

        lote = loteRepository.save(lote);
        return new LoteResponseDTO(lote);
    }

    @Transactional
    public LoteResponseDTO atualizar(Long id, LoteRequestDTO dto) {
        Lote lote = loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote", "id", id));

        Produto produto = produtoService.buscarEntidadePorId(dto.produtoId());

        lote.setProduto(produto);
        lote.setDataEntrada(dto.dataEntrada());
        lote.setUnidadeMedida(dto.unidadeMedida());
        lote.setDataValidade(dto.dataValidade());
        lote.setTamanho(dto.tamanho());
        lote.setVoltagem(dto.voltagem());
        lote.setObservacoes(dto.observacoes());

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
        Lote lote = loteRepository.findById(loteId)
                .orElseThrow(() -> new ResourceNotFoundException("Lote", "id", loteId));

        int novaQuantidade = lote.getQuantidadeAtual() + delta;

        if (novaQuantidade < 0) {
            throw new BusinessException("Quantidade insuficiente em estoque. Disponível: " + lote.getQuantidadeAtual());
        }

        lote.setQuantidadeAtual(novaQuantidade);
        loteRepository.save(lote);
    }

    @Transactional(readOnly = true)
    public Lote buscarEntidadePorId(Long id) {
        return loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote", "id", id));
    }
}
