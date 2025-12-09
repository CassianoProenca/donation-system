package com.ong.backend.repositories;

import com.ong.backend.models.LoteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LoteItemRepository extends JpaRepository<LoteItem, Long> {

  
  @Query("SELECT COALESCE(SUM(li.quantidade), 0) FROM LoteItem li WHERE li.produto.id = :produtoId")
  Integer calcularEstoqueTotalPorProduto(@Param("produtoId") Long produtoId);
}
