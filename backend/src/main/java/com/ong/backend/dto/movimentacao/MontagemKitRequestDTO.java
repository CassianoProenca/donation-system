package com.ong.backend.dto.movimentacao;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MontagemKitRequestDTO(
    @NotNull(message = "O ID do produto (Kit) é obrigatório")
    Long produtoKitId,

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade deve ser maior que zero")
    Integer quantidade
) {}