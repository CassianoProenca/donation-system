package com.ong.backend.specifications;

import com.ong.backend.models.LoteItem;
import com.ong.backend.models.Produto;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProdutoSpecs {

    public static Specification<Produto> comFiltros(String nome,
            Long categoriaId,
            Integer estoqueAte,
            boolean somenteComEstoque) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (nome != null && !nome.trim().isEmpty()) {
                predicates.add(builder.like(builder.lower(root.get("nome")), "%" + nome.toLowerCase() + "%"));
            }

            if (categoriaId != null) {
                predicates.add(builder.equal(root.get("categoria").get("id"), categoriaId));
            }

            if (estoqueAte != null || somenteComEstoque) {
                Subquery<Long> estoqueSubquery = query.subquery(Long.class);
                Root<LoteItem> itemRoot = estoqueSubquery.from(LoteItem.class);
                estoqueSubquery.select(builder.coalesce(builder.sum(itemRoot.get("quantidade")), 0L));
                estoqueSubquery.where(builder.equal(itemRoot.get("produto"), root));

                if (somenteComEstoque) {
                    predicates.add(builder.greaterThan(estoqueSubquery, 0L));
                }

                if (estoqueAte != null) {
                    predicates.add(builder.lessThan(estoqueSubquery, estoqueAte.longValue()));
                }
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}