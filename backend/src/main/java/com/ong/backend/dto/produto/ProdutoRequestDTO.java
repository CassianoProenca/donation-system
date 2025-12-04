package com.ong.backend.dto.produto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ProdutoRequestDTO(
    
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
    String nome,
    
    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    String descricao,
    
    @Size(max = 50, message = "Código de barras deve ter no máximo 50 caracteres")
    String codigoBarrasFabricante,
    
    @NotNull(message = "Categoria é obrigatória")
    Long categoriaId,

    Boolean isKit,

    @Valid
    List<ComponenteRequestDTO> componentes
) {}