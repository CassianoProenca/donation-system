package com.ong.backend.dto.categoria;

import com.ong.backend.models.Categoria;

public record CategoriaSimplesDTO(
    Long id,
    String nome,
    String icone
) {
    public CategoriaSimplesDTO(Categoria categoria) {
        this(
            categoria.getId(),
            categoria.getNome(),
            categoria.getIcone()
        );
    }
}
