package com.ong.backend.dto.lote;

import com.ong.backend.models.Lote;

import java.util.stream.Collectors;

public record LoteSimplesDTO(
    Long id,
    String descricaoProdutos,
    Integer quantidadeAtual,
    String codigoBarras
) {
    public LoteSimplesDTO(Lote lote) {
        this(
            lote.getId(),
            lote.getItens().isEmpty() ? "Sem produtos" : 
                lote.getItens().stream()
                    .map(item -> item.getProduto().getNome() + " (" + item.getQuantidade() + ")")
                    .collect(Collectors.joining(", ")),
            lote.getQuantidadeAtual(),
            lote.getCodigoBarras()
        );
    }
}
