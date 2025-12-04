package com.ong.backend.repositories;

import com.ong.backend.models.ComposicaoProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComposicaoProdutoRepository extends JpaRepository<ComposicaoProduto, Long> {
}