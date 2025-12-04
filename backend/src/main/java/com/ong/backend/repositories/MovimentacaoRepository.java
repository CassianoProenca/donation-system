package com.ong.backend.repositories;

import com.ong.backend.models.Movimentacao;
import com.ong.backend.models.Lote;
import com.ong.backend.models.Usuario;
import com.ong.backend.models.TipoMovimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Importar
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimentacaoRepository
        extends JpaRepository<Movimentacao, Long>, JpaSpecificationExecutor<Movimentacao> {

    List<Movimentacao> findByLote(Lote lote);

    List<Movimentacao> findByLoteId(Long loteId);

    List<Movimentacao> findByUsuario(Usuario usuario);

    List<Movimentacao> findByUsuarioId(Long usuarioId);

    List<Movimentacao> findByTipo(TipoMovimentacao tipo);

    List<Movimentacao> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim);

    List<Movimentacao> findByLoteIdOrderByDataHoraDesc(Long loteId);
}