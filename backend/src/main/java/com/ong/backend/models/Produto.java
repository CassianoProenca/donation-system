package com.ong.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;

@Entity
@Data
@NoArgsConstructor
@Table(name = "produtos", indexes = {
        @Index(name = "idx_produto_categoria", columnList = "categoria_id"),
        @Index(name = "idx_produto_nome", columnList = "nome"),
        @Index(name = "idx_produto_codigo_barras", columnList = "codigo_barras_fabricante")
})
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String descricao;

    private String codigoBarrasFabricante;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false)
    private boolean isKit = false;

    @OneToMany(mappedBy = "produtoPai", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComposicaoProduto> componentes = new ArrayList<>();
}