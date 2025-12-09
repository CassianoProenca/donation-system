package com.ong.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "movimentacoes", indexes = {
        @Index(name = "idx_movimentacao_lote", columnList = "lote_id"),
        @Index(name = "idx_movimentacao_usuario", columnList = "usuario_id"),
        @Index(name = "idx_movimentacao_data_hora", columnList = "data_hora"),
        @Index(name = "idx_movimentacao_tipo", columnList = "tipo")
})
public class Movimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimentacao tipo;

    @Column(nullable = false)
    @jakarta.validation.constraints.Min(value = 1, message = "Quantidade deve ser maior que zero")
    private Integer quantidade;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    public Movimentacao(Lote lote, Usuario usuario, TipoMovimentacao tipo, Integer quantidade) {
        this.lote = lote;
        this.usuario = usuario;
        this.tipo = tipo;
        this.quantidade = quantidade;
        this.dataHora = LocalDateTime.now();
    }
}