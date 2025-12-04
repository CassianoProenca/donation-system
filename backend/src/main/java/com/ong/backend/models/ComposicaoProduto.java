package com.ong.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "composicao_produtos")
public class ComposicaoProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_pai_id", nullable = false)
    private Produto produtoPai; // O Kit (ex: Cesta Básica)

    @ManyToOne
    @JoinColumn(name = "produto_componente_id", nullable = false)
    private Produto componente; // O Item individual (ex: Arroz)

    @Column(nullable = false)
    private Integer quantidade; // Quantidade deste item necessária para montar 1 kit
}