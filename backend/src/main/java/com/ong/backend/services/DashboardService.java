package com.ong.backend.services;

import com.ong.backend.dto.dashboard.*;
import com.ong.backend.models.TipoMovimentacao;
import com.ong.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;
    private final LoteRepository loteRepository;
    private final LoteItemRepository loteItemRepository;
    private final MovimentacaoRepository movimentacaoRepository;

    @Transactional(readOnly = true)
    public DashboardMetricsDTO obterMetricas(LocalDate dataInicio, LocalDate dataFim) {
        // Se não informar datas, assume do dia 1 do mês atual até hoje (conforme pedido pelo PO)
        if (dataInicio == null) {
            dataInicio = LocalDate.now().withDayOfMonth(1);
        }
        if (dataFim == null) {
            dataFim = LocalDate.now();
        }

        LocalDateTime inicioPeriodo = dataInicio.atStartOfDay();
        LocalDateTime fimPeriodo = dataFim.atTime(23, 59, 59);

        Long totalCategorias = categoriaRepository.count();
        Long totalProdutos = produtoRepository.count();
        Long totalLotes = loteRepository.count();

        Long estoqueTotal = loteRepository.findAll().stream()
                .mapToLong(lote -> lote.getQuantidadeAtual() != null ? lote.getQuantidadeAtual() : 0L)
                .sum();

        Integer movimentacoesNoPeriodo = movimentacaoRepository.findByDataHoraBetween(inicioPeriodo, fimPeriodo).size();

        AlertasCriticosDTO alertas = obterAlertasCriticos();
        List<EvolucaoEstoqueDTO> evolucaoEstoque = obterEvolucaoEstoque(dataInicio, dataFim);
        List<TopProdutoDTO> top5Produtos = obterTop5ProdutosMaisDistribuidos(inicioPeriodo, fimPeriodo);
        List<MovimentacaoResumoDTO> ultimasMovimentacoes = obterUltimasMovimentacoes(10, inicioPeriodo, fimPeriodo);
        List<MovimentacaoPorDiaDTO> movimentacoesPorDia = obterMovimentacoesPorDia(dataInicio, dataFim);
        List<TipoMovimentacaoCountDTO> movimentacoesPorTipo = obterMovimentacoesPorTipo(inicioPeriodo, fimPeriodo);

        return new DashboardMetricsDTO(
                totalCategorias,
                totalProdutos,
                totalLotes,
                estoqueTotal,
                movimentacoesNoPeriodo, // Alterado para refletir o período selecionado
                alertas,
                evolucaoEstoque,
                top5Produtos,
                ultimasMovimentacoes,
                movimentacoesPorDia,
                movimentacoesPorTipo);
    }

    private AlertasCriticosDTO obterAlertasCriticos() {
        LocalDate hoje = LocalDate.now();
        LocalDate em30Dias = hoje.plusDays(30);

        Long lotesVencendo = loteRepository.findAll().stream()
                .filter(lote -> {
                    if (lote.getQuantidadeAtual() == null || lote.getQuantidadeAtual() <= 0)
                        return false;

                    return lote.getItens().stream()
                            .anyMatch(item -> {
                                if (item.getDataValidade() == null)
                                    return false;
                                LocalDate validade = item.getDataValidade();
                                return !validade.isBefore(hoje) && !validade.isAfter(em30Dias);
                            });
                })
                .count();

        // Calcula produtos com estoque baixo (ex: < 10 unidades no total)
        Long produtosEstoqueBaixo = produtoRepository.findAll().stream()
                .filter(p -> {
                    Integer total = loteItemRepository.calcularEstoqueTotalPorProduto(p.getId());
                    return total != null && total > 0 && total < 10;
                })
                .count();

        Long lotesSemEstoque = loteRepository.findAll().stream()
                .filter(lote -> lote.getQuantidadeAtual() == null || lote.getQuantidadeAtual() == 0)
                .count();

        return new AlertasCriticosDTO(lotesVencendo, produtosEstoqueBaixo, lotesSemEstoque);
    }

    private List<EvolucaoEstoqueDTO> obterEvolucaoEstoque(LocalDate dataInicio, LocalDate dataFim) {
        List<EvolucaoEstoqueDTO> evolucao = new ArrayList<>();
        
        long estoqueSimulado = loteRepository.findAll().stream()
                .mapToLong(lote -> lote.getQuantidadeAtual() != null ? lote.getQuantidadeAtual() : 0L)
                .sum();

        LocalDate hoje = LocalDate.now();
        
        // Se o fim do período for antes de hoje, precisamos voltar o estoque até aquele dia
        if (dataFim.isBefore(hoje)) {
            List<com.ong.backend.models.Movimentacao> movsFuturas = movimentacaoRepository.findByDataHoraBetween(
                dataFim.plusDays(1).atStartOfDay(), 
                hoje.atTime(23,59,59)
            );
            for (com.ong.backend.models.Movimentacao m : movsFuturas) {
                if (m.getTipo() == TipoMovimentacao.ENTRADA || m.getTipo() == TipoMovimentacao.AJUSTE_GANHO) {
                    estoqueSimulado -= m.getQuantidade();
                } else {
                    estoqueSimulado += m.getQuantidade();
                }
            }
        }

        // Reconstrói o histórico dia a dia dentro do range selecionado
        for (LocalDate dia = dataFim; !dia.isBefore(dataInicio); dia = dia.minusDays(1)) {
            evolucao.add(0, new EvolucaoEstoqueDTO(
                    dia.format(DateTimeFormatter.ofPattern("dd/MM")),
                    estoqueSimulado));
            
            LocalDateTime inicioDia = dia.atStartOfDay();
            LocalDateTime fimDia = dia.atTime(23, 59, 59);
            List<com.ong.backend.models.Movimentacao> movsDia = movimentacaoRepository.findByDataHoraBetween(inicioDia, fimDia);
            
            for (com.ong.backend.models.Movimentacao m : movsDia) {
                if (m.getTipo() == TipoMovimentacao.ENTRADA || m.getTipo() == TipoMovimentacao.AJUSTE_GANHO) {
                    estoqueSimulado -= m.getQuantidade();
                } else {
                    estoqueSimulado += m.getQuantidade();
                }
            }
        }
        return evolucao;
    }

    private List<TopProdutoDTO> obterTop5ProdutosMaisDistribuidos(LocalDateTime inicio, LocalDateTime fim) {
        Map<String, Long> saidasPorProduto = movimentacaoRepository.findAll().stream()
                .filter(mov -> mov.getTipo() == TipoMovimentacao.SAIDA)
                .filter(mov -> !mov.getDataHora().isBefore(inicio) && !mov.getDataHora().isAfter(fim))
                .collect(Collectors.groupingBy(
                        mov -> {
                            if (mov.getLote().getItens() != null && !mov.getLote().getItens().isEmpty()) {
                                return mov.getLote().getItens().get(0).getProduto().getNome();
                            }
                            return "Produto Desconhecido";
                        },
                        Collectors.counting()));

        return saidasPorProduto.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> new TopProdutoDTO(
                        entry.getKey(),
                        entry.getValue(),
                        fim.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))))
                .collect(Collectors.toList());
    }

    private List<MovimentacaoResumoDTO> obterUltimasMovimentacoes(int limite, LocalDateTime inicio, LocalDateTime fim) {
        return movimentacaoRepository.findAll().stream()
                .filter(mov -> !mov.getDataHora().isBefore(inicio) && !mov.getDataHora().isAfter(fim))
                .sorted((a, b) -> b.getDataHora().compareTo(a.getDataHora()))
                .limit(limite)
                .map(mov -> {
                    String produtoNome = "Produto Desconhecido";
                    if (mov.getLote().getItens() != null && !mov.getLote().getItens().isEmpty()) {
                        produtoNome = mov.getLote().getItens().get(0).getProduto().getNome();
                    }

                    return new MovimentacaoResumoDTO(
                            mov.getId(),
                            mov.getDataHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                            produtoNome,
                            mov.getTipo().name(),
                            mov.getQuantidade(),
                            mov.getUsuario().getNome());
                })
                .collect(Collectors.toList());
    }

    private List<MovimentacaoPorDiaDTO> obterMovimentacoesPorDia(LocalDate dataInicio, LocalDate dataFim) {
        List<MovimentacaoPorDiaDTO> resultado = new ArrayList<>();

        for (LocalDate dia = dataInicio; !dia.isAfter(dataFim); dia = dia.plusDays(1)) {
            LocalDateTime inicioDia = dia.atStartOfDay();
            LocalDateTime fimDia = dia.atTime(23, 59, 59);

            List<com.ong.backend.models.Movimentacao> movsDia = movimentacaoRepository.findByDataHoraBetween(inicioDia,
                    fimDia);

            int entradas = (int) movsDia.stream()
                    .filter(m -> m.getTipo() == TipoMovimentacao.ENTRADA)
                    .count();

            int saidas = (int) movsDia.stream()
                    .filter(m -> m.getTipo() == TipoMovimentacao.SAIDA)
                    .count();

            resultado.add(new MovimentacaoPorDiaDTO(
                    dia.format(DateTimeFormatter.ofPattern("dd/MM")),
                    movsDia.size(),
                    entradas,
                    saidas));
        }

        return resultado;
    }

    private List<TipoMovimentacaoCountDTO> obterMovimentacoesPorTipo(LocalDateTime inicio, LocalDateTime fim) {
        Map<TipoMovimentacao, Long> countPorTipo = movimentacaoRepository.findAll().stream()
                .filter(mov -> !mov.getDataHora().isBefore(inicio) && !mov.getDataHora().isAfter(fim))
                .collect(Collectors.groupingBy(
                        com.ong.backend.models.Movimentacao::getTipo,
                        Collectors.counting()));

        return countPorTipo.entrySet().stream()
                .map(entry -> new TipoMovimentacaoCountDTO(
                        entry.getKey().name(),
                        getLabelTipoMovimentacao(entry.getKey().name()),
                        entry.getValue()))
                .collect(Collectors.toList());
    }

    private String getLabelTipoMovimentacao(String tipo) {
        return switch (tipo) {
            case "ENTRADA" -> "Entradas";
            case "SAIDA" -> "Saídas";
            case "AJUSTE_PERDA" -> "Perdas";
            case "AJUSTE_GANHO" -> "Ganhos";
            default -> tipo;
        };
    }
}
