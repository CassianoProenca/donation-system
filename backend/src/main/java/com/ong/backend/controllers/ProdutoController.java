package com.ong.backend.controllers;

import com.ong.backend.dto.produto.ProdutoRequestDTO;
import com.ong.backend.dto.produto.ProdutoResponseDTO;
import com.ong.backend.dto.produto.ProdutoSimplesDTO;
import com.ong.backend.dto.produto.ProdutoDetalhesDTO;
import com.ong.backend.services.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarTodos(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Long categoriaId) {
        return ResponseEntity.ok(produtoService.listarComFiltros(nome, categoriaId));
    }

    @GetMapping("/simples")
    public ResponseEntity<List<ProdutoSimplesDTO>> listarTodosSimples() {
        return ResponseEntity.ok(produtoService.listarTodosSimples());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @GetMapping("/{id}/detalhes")
    public ResponseEntity<ProdutoDetalhesDTO> buscarDetalhesPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarDetalhesPorId(id));
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<ProdutoResponseDTO>> buscarPorCategoria(@PathVariable Long categoriaId) {
        return ResponseEntity.ok(produtoService.buscarPorCategoria(categoriaId));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ProdutoResponseDTO>> buscarPorNome(@RequestParam String nome) {
        return ResponseEntity.ok(produtoService.buscarPorNome(nome));
    }

    @PostMapping
    public ResponseEntity<ProdutoResponseDTO> criar(@Valid @RequestBody ProdutoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProdutoRequestDTO dto) {
        return ResponseEntity.ok(produtoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        produtoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
