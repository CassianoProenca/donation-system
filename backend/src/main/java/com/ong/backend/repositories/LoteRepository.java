package com.ong.backend.repositories;

import com.ong.backend.models.Lote;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long>, JpaSpecificationExecutor<Lote> {

    List<Lote> findByQuantidadeAtualGreaterThan(Integer quantidade);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM Lote l WHERE l.id = :id")
    Optional<Lote> findByIdWithLock(@Param("id") Long id);
}