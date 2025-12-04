package com.ong.backend.repositories;

import com.ong.backend.models.Produto;
import com.ong.backend.models.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Importar
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long>, JpaSpecificationExecutor<Produto> {
    
    List<Produto> findByCategoria(Categoria categoria);
    List<Produto> findByCategoriaId(Long categoriaId);
    Optional<Produto> findByCodigoBarrasFabricante(String codigoBarrasFabricante);
    List<Produto> findByNomeContainingIgnoreCase(String nome);
}