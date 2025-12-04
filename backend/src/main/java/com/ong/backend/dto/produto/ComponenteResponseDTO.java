package com.ong.backend.dto.produto;

public record ComponenteResponseDTO(
    Long produtoId,
    String nome,
    Integer quantidade
) {}