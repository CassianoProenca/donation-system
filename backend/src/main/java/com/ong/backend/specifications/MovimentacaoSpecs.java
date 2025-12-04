package com.ong.backend.specifications;

import com.ong.backend.models.Movimentacao;
import com.ong.backend.models.TipoMovimentacao;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MovimentacaoSpecs {

    public static Specification<Movimentacao> comFiltros(
            String tipo,
            Long loteId,
            Long usuarioId,
            LocalDateTime dataInicio,
            LocalDateTime dataFim) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (tipo != null && !tipo.trim().isEmpty()) {
                predicates.add(builder.equal(root.get("tipo"), TipoMovimentacao.valueOf(tipo)));
            }

            if (loteId != null) {
                predicates.add(builder.equal(root.get("lote").get("id"), loteId));
            }

            if (usuarioId != null) {
                predicates.add(builder.equal(root.get("usuario").get("id"), usuarioId));
            }

            if (dataInicio != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("dataHora"), dataInicio));
            }

            if (dataFim != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("dataHora"), dataFim));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}