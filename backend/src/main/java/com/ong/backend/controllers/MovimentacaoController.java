package com.ong.backend.controllers;

import com.ong.backend.dto.movimentacao.MovimentacaoRequestDTO;
import com.ong.backend.dto.movimentacao.MovimentacaoResponseDTO;
import com.ong.backend.dto.movimentacao.MovimentacaoSimplesDTO;
import com.ong.backend.dto.movimentacao.MovimentacaoDetalhesDTO;
import com.ong.backend.dto.movimentacao.MontagemKitRequestDTO;
import com.ong.backend.models.TipoMovimentacao;
import com.ong.backend.services.MovimentacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes")
@RequiredArgsConstructor
public class MovimentacaoController {

    private final MovimentacaoService movimentacaoService;

    @GetMapping
    public ResponseEntity<Page<MovimentacaoResponseDTO>> listarTodas(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Long loteId,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim,
            @RequestParam(required = false) String busca,
            @PageableDefault(page = 0, size = 10, sort = "dataHora", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(
                movimentacaoService.listarComFiltros(tipo, loteId, usuarioId, dataInicio, dataFim, busca, pageable));
    }

    @GetMapping("/simples")
    public ResponseEntity<List<MovimentacaoSimplesDTO>> listarTodasSimples() {
        return ResponseEntity.ok(movimentacaoService.listarTodasSimples());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimentacaoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(movimentacaoService.buscarPorId(id));
    }

    @GetMapping("/{id}/detalhes")
    public ResponseEntity<MovimentacaoDetalhesDTO> buscarDetalhesPorId(@PathVariable Long id) {
        return ResponseEntity.ok(movimentacaoService.buscarDetalhesPorId(id));
    }

    @GetMapping("/lote/{loteId}")
    public ResponseEntity<List<MovimentacaoSimplesDTO>> buscarPorLote(@PathVariable Long loteId) {
        return ResponseEntity.ok(movimentacaoService.buscarPorLote(loteId));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<MovimentacaoSimplesDTO>> buscarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(movimentacaoService.buscarPorUsuario(usuarioId));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<MovimentacaoSimplesDTO>> buscarPorTipo(@PathVariable TipoMovimentacao tipo) {
        return ResponseEntity.ok(movimentacaoService.buscarPorTipo(tipo));
    }

    @GetMapping("/periodo")
    public ResponseEntity<List<MovimentacaoSimplesDTO>> buscarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(movimentacaoService.buscarPorPeriodo(inicio, fim));
    }

    @PostMapping
    public ResponseEntity<MovimentacaoResponseDTO> criar(@Valid @RequestBody MovimentacaoRequestDTO dto,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(movimentacaoService.criar(dto, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        movimentacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/montagem")
    public ResponseEntity<MovimentacaoResponseDTO> montarKit(
            @Valid @RequestBody MontagemKitRequestDTO dto,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(movimentacaoService.montarKit(dto, userDetails.getUsername()));
    }
}
