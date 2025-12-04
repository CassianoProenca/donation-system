package com.ong.backend.specifications;

import com.ong.backend.models.Produto;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProdutoSpecs {

    public static Specification<Produto> comFiltros(String nome, Long categoriaId) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (nome != null && !nome.trim().isEmpty()) {
                predicates.add(builder.like(builder.lower(root.get("nome")), "%" + nome.toLowerCase() + "%"));
            }

            if (categoriaId != null) {
                predicates.add(builder.equal(root.get("categoria").get("id"), categoriaId));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}