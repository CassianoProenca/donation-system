package com.ong.backend.dto.produto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ComponenteRequestDTO(
    @NotNull(message = "ID do componente é obrigatório")
    Long produtoId,

    @NotNull(message = "Quantidade é obrigatória")
    @Positive(message = "Quantidade deve ser maior que zero")
    Integer quantidade
) {}