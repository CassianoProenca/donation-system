package com.ong.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@Table(name = "lote_itens", indexes = {
        @Index(name = "idx_lote_item_produto", columnList = "produto_id"),
        @Index(name = "idx_lote_item_lote", columnList = "lote_id"),
        @Index(name = "idx_lote_item_validade", columnList = "data_validade")
})
public class LoteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @ManyToOne(optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    @jakarta.validation.constraints.Min(value = 1, message = "Quantidade deve ser maior que zero")
    private Integer quantidade;

    private LocalDate dataValidade;
    private String tamanho;
    private String voltagem;
}
