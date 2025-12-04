package com.ong.backend.dto.produto;

import com.ong.backend.dto.categoria.CategoriaResponseDTO;
import com.ong.backend.models.Produto;
import java.util.List;
import java.util.stream.Collectors;

public record ProdutoResponseDTO(
    Long id,
    String nome,
    String descricao,
    String codigoBarrasFabricante,
    CategoriaResponseDTO categoria,
    boolean isKit,
    List<ComponenteResponseDTO> componentes
) {
    public ProdutoResponseDTO(Produto produto) {
        this(
            produto.getId(),
            produto.getNome(),
            produto.getDescricao(),
            produto.getCodigoBarrasFabricante(),
            new CategoriaResponseDTO(produto.getCategoria()),
            produto.isKit(),
            produto.getComponentes() != null ? 
                produto.getComponentes().stream()
                    .map(c -> new ComponenteResponseDTO(
                        c.getComponente().getId(), 
                        c.getComponente().getNome(), 
                        c.getQuantidade()))
                    .collect(Collectors.toList()) 
                : List.of()
        );
    }
}