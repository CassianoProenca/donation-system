package com.ong.backend.specifications;

import com.ong.backend.models.Lote;
import com.ong.backend.models.LoteItem;
import com.ong.backend.models.Produto;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class LoteSpecs {

  public static Specification<Lote> comFiltros(
      Long produtoId,
      LocalDate dataInicio,
      LocalDate dataFim,
      Boolean comEstoque,
      String busca) {
    return (root, query, builder) -> {
      List<Predicate> predicates = new ArrayList<>();

      query.distinct(true);

      Join<Lote, LoteItem> itensJoin = root.join("itens", JoinType.LEFT);
      Join<LoteItem, Produto> produtoJoin = itensJoin.join("produto", JoinType.LEFT);

      if (produtoId != null) {
        predicates.add(builder.equal(produtoJoin.get("id"), produtoId));
      }

      if (dataInicio != null) {
        predicates.add(builder.greaterThanOrEqualTo(root.get("dataEntrada"), dataInicio));
      }
      if (dataFim != null) {
        predicates.add(builder.lessThanOrEqualTo(root.get("dataEntrada"), dataFim));
      }

      if (comEstoque != null) {
        if (comEstoque) {
          predicates.add(builder.greaterThan(root.get("quantidadeAtual"), 0));
        } else {
          predicates.add(builder.equal(root.get("quantidadeAtual"), 0));
        }
      }

      if (busca != null && !busca.trim().isEmpty()) {
        String termo = "%" + busca.trim().toLowerCase() + "%";

        Predicate porId = builder.like(root.get("id").as(String.class), termo);
        Predicate porNomeProduto = builder.like(builder.lower(produtoJoin.get("nome")), termo);
        Predicate porEanProduto = builder.like(produtoJoin.get("codigoBarrasFabricante"), termo);

        predicates.add(builder.or(porId, porNomeProduto, porEanProduto));
      }

      return builder.and(predicates.toArray(new Predicate[0]));
    };
  }
}