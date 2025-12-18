package com.ong.backend.specifications;

import com.ong.backend.models.Movimentacao;
import com.ong.backend.models.TipoMovimentacao;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

import com.ong.backend.models.Lote;
import com.ong.backend.models.LoteItem;
import com.ong.backend.models.Produto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MovimentacaoSpecs {

    public static Specification<Movimentacao> comFiltros(
            String tipo,
            Long loteId,
            Long usuarioId,
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            String busca) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            query.distinct(true);

            Join<Movimentacao, Lote> loteJoin = root.join("lote", JoinType.LEFT);
            Join<Lote, LoteItem> itemJoin = loteJoin.join("itens", JoinType.LEFT);
            Join<LoteItem, Produto> produtoJoin = itemJoin.join("produto", JoinType.LEFT);

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

            if (busca != null && !busca.trim().isEmpty()) {
                String termo = "%" + busca.trim().toLowerCase() + "%";
                Predicate porId = builder.like(root.get("id").as(String.class), termo);
                Predicate porUsuario = builder.or(
                        builder.like(builder.lower(root.get("usuario").get("nome")), termo),
                        builder.like(builder.lower(root.get("usuario").get("email")), termo));
                Predicate porProduto = builder.like(builder.lower(produtoJoin.get("nome")), termo);
                predicates.add(builder.or(porId, porUsuario, porProduto));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}