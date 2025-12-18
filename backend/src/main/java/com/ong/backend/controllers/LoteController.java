package com.ong.backend.controllers;

import com.ong.backend.dto.lote.LoteRequestDTO;
import com.ong.backend.dto.lote.LoteResponseDTO;
import com.ong.backend.dto.lote.LoteSimplesDTO;
import com.ong.backend.dto.lote.LoteDetalhesDTO;
import com.ong.backend.services.LoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")
@RequiredArgsConstructor
public class LoteController {

    private final LoteService loteService;

    @GetMapping
    public ResponseEntity<Page<LoteResponseDTO>> listarTodos(
            @RequestParam(required = false) Long produtoId,
            @RequestParam(required = false) String dataEntradaInicio,
            @RequestParam(required = false) String dataEntradaFim,
            @RequestParam(required = false) String dataValidadeInicio,
            @RequestParam(required = false) String dataValidadeFim,
            @RequestParam(required = false) Boolean comEstoque,
            @RequestParam(required = false) String busca,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(loteService.listarComFiltros(
                produtoId,
                dataEntradaInicio,
                dataEntradaFim,
                dataValidadeInicio,
                dataValidadeFim,
                comEstoque,
                busca,
                pageable));
    }

    @GetMapping("/simples")
    public ResponseEntity<List<LoteSimplesDTO>> listarTodosSimples() {
        return ResponseEntity.ok(loteService.listarTodosSimples());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoteResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(loteService.buscarPorId(id));
    }

    @GetMapping("/{id}/detalhes")
    public ResponseEntity<LoteDetalhesDTO> buscarDetalhesPorId(@PathVariable Long id) {
        return ResponseEntity.ok(loteService.buscarDetalhesPorId(id));
    }

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<List<LoteResponseDTO>> buscarPorProduto(@PathVariable Long produtoId) {
        return ResponseEntity.ok(loteService.buscarPorProduto(produtoId));
    }

    @GetMapping("/vencimento")
    public ResponseEntity<List<LoteSimplesDTO>> buscarProximosAoVencimento(
            @RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(loteService.buscarProximosAoVencimento(dias));
    }

    @GetMapping("/estoque")
    public ResponseEntity<List<LoteSimplesDTO>> buscarComEstoque() {
        return ResponseEntity.ok(loteService.buscarComEstoque());
    }

    @PostMapping
    public ResponseEntity<LoteResponseDTO> criar(
            @Valid @RequestBody LoteRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(loteService.criar(dto, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoteResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody LoteRequestDTO dto) {
        return ResponseEntity.ok(loteService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        loteService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
