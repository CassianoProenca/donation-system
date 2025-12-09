package com.ong.backend.services;

import com.ong.backend.dto.doacao.EntradaDoacaoDTO;
import com.ong.backend.dto.lote.LoteItemRequestDTO;
import com.ong.backend.dto.lote.LoteRequestDTO;
import com.ong.backend.dto.lote.LoteResponseDTO;
import com.ong.backend.models.UnidadeMedida;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoacaoService {

    private final LoteService loteService;

    @Transactional
    public List<LoteResponseDTO> processarEntradaMista(EntradaDoacaoDTO dto, String usuarioEmail) {
        List<LoteResponseDTO> lotesCriados = new ArrayList<>();

        for (var item : dto.itens()) {
            LoteItemRequestDTO itemRequest = new LoteItemRequestDTO(
                    item.produtoId(),
                    item.quantidade(),
                    item.validade(),
                    item.tamanho(),
                    item.voltagem());

            String obsFinal = (dto.observacoesGerais() != null && !dto.observacoesGerais().isBlank()
                    ? dto.observacoesGerais()
                    : "Entrada Rápida");

            if (item.observacoesItem() != null && !item.observacoesItem().isBlank()) {
                obsFinal += " | Detalhe: " + item.observacoesItem();
            }

            UnidadeMedida unidade = item.unidadeMedida() != null ? item.unidadeMedida() : UnidadeMedida.UNIDADE;

            LoteRequestDTO loteIndividual = new LoteRequestDTO(
                    List.of(itemRequest),
                    dto.dataEntrada(),
                    unidade,
                    obsFinal);

            LoteResponseDTO loteCriado = loteService.criar(loteIndividual, usuarioEmail);
            lotesCriados.add(loteCriado);
        }

        return lotesCriados;
    }
}