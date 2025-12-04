package com.ong.backend.dto.produto;

import com.ong.backend.dto.categoria.CategoriaResponseDTO;
import com.ong.backend.models.Produto;
import java.util.List;
import java.util.stream.Collectors;

public record ProdutoDetalhesDTO(
        Long id,
        String nome,
        String descricao,
        String codigoBarrasFabricante,
        CategoriaResponseDTO categoria,
        Integer totalEmEstoque,
        boolean isKit,
        List<String> composicao) {
    public ProdutoDetalhesDTO(Produto produto, Integer totalEmEstoque) {
        this(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getCodigoBarrasFabricante(),
                new CategoriaResponseDTO(produto.getCategoria()),
                totalEmEstoque,
                produto.isKit(),
                produto.getComponentes() != null ? produto.getComponentes().stream()
                        .map(c -> c.getQuantidade() + "x " + c.getComponente().getNome())
                        .collect(Collectors.toList())
                        : List.of());
    }
}