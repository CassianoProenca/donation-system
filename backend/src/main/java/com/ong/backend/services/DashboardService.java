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
    private final MovimentacaoRepository movimentacaoRepository;

    @Transactional(readOnly = true)
    public DashboardMetricsDTO obterMetricas() {
        Long totalCategorias = categoriaRepository.count();
        Long totalProdutos = produtoRepository.count();
        Long totalLotes = loteRepository.count();

        Long estoqueTotal = loteRepository.findAll().stream()
                .mapToLong(lote -> lote.getQuantidadeAtual() != null ? lote.getQuantidadeAtual() : 0L)
                .sum();

        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioHoje = hoje.atStartOfDay();
        LocalDateTime fimHoje = hoje.atTime(23, 59, 59);
        Integer movimentacoesHoje = movimentacaoRepository.findByDataHoraBetween(inicioHoje, fimHoje).size();

        AlertasCriticosDTO alertas = obterAlertasCriticos();
        List<EvolucaoEstoqueDTO> evolucaoEstoque = obterEvolucaoEstoque();
        List<TopProdutoDTO> top5Produtos = obterTop5ProdutosMaisDistribuidos();
        List<MovimentacaoResumoDTO> ultimasMovimentacoes = obterUltimasMovimentacoes(10);
        List<MovimentacaoPorDiaDTO> movimentacoesPorDia = obterMovimentacoesPorDia(7);
        List<TipoMovimentacaoCountDTO> movimentacoesPorTipo = obterMovimentacoesPorTipo();

        return new DashboardMetricsDTO(
                totalCategorias,
                totalProdutos,
                totalLotes,
                estoqueTotal,
                movimentacoesHoje,
                alertas,
                evolucaoEstoque,
                top5Produtos,
                ultimasMovimentacoes,
                movimentacoesPorDia,
                movimentacoesPorTipo);
    }

    private AlertasCriticosDTO obterAlertasCriticos() {
        LocalDate hoje = LocalDate.now();
        LocalDate em7Dias = hoje.plusDays(7);

        Long lotesVencendo = loteRepository.findAll().stream()
                .filter(lote -> {
                    if (lote.getItens() == null || lote.getItens().isEmpty())
                        return false;
                    if (lote.getQuantidadeAtual() == null || lote.getQuantidadeAtual() == 0)
                        return false;

                    return lote.getItens().stream()
                            .anyMatch(item -> {
                                if (item.getDataValidade() == null)
                                    return false;
                                LocalDate validade = item.getDataValidade();
                                return !validade.isBefore(hoje) && !validade.isAfter(em7Dias);
                            });
                })
                .count();

        Long produtosEstoqueBaixo = 0L;

        Long lotesSemEstoque = loteRepository.findAll().stream()
                .filter(lote -> lote.getQuantidadeAtual() == null || lote.getQuantidadeAtual() == 0)
                .count();

        return new AlertasCriticosDTO(lotesVencendo, produtosEstoqueBaixo, lotesSemEstoque);
    }

    private List<EvolucaoEstoqueDTO> obterEvolucaoEstoque() {
        Long estoqueAtual = loteRepository.findAll().stream()
                .mapToLong(lote -> lote.getQuantidadeAtual() != null ? lote.getQuantidadeAtual() : 0L)
                .sum();

        List<EvolucaoEstoqueDTO> evolucao = new ArrayList<>();
        LocalDate hoje = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            LocalDate dia = hoje.minusDays(i);
            evolucao.add(new EvolucaoEstoqueDTO(
                    dia.format(DateTimeFormatter.ofPattern("dd/MM")),
                    estoqueAtual));
        }
        return evolucao;
    }

    private List<TopProdutoDTO> obterTop5ProdutosMaisDistribuidos() {
        Map<String, Long> saidasPorProduto = movimentacaoRepository.findAll().stream()
                .filter(mov -> mov.getTipo() == TipoMovimentacao.SAIDA)
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
                        LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))))
                .collect(Collectors.toList());
    }

    private List<MovimentacaoResumoDTO> obterUltimasMovimentacoes(int limite) {
        return movimentacaoRepository.findAll().stream()
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

    private List<MovimentacaoPorDiaDTO> obterMovimentacoesPorDia(int dias) {
        LocalDate hoje = LocalDate.now();
        List<MovimentacaoPorDiaDTO> resultado = new ArrayList<>();

        for (int i = dias - 1; i >= 0; i--) {
            LocalDate dia = hoje.minusDays(i);
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

    private List<TipoMovimentacaoCountDTO> obterMovimentacoesPorTipo() {
        Map<TipoMovimentacao, Long> countPorTipo = movimentacaoRepository.findAll().stream()
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
