package com.ong.backend.controllers;

import com.ong.backend.dto.categoria.CategoriaRequestDTO;
import com.ong.backend.dto.categoria.CategoriaResponseDTO;
import com.ong.backend.dto.categoria.CategoriaSimplesDTO;
import com.ong.backend.services.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listarTodas(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String tipo) {
        return ResponseEntity.ok(categoriaService.listarComFiltros(nome, tipo));
    }

    @GetMapping("/simples")
    public ResponseEntity<List<CategoriaSimplesDTO>> listarTodasSimples() {
        return ResponseEntity.ok(categoriaService.listarTodasSimples());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CategoriaResponseDTO> criar(@Valid @RequestBody CategoriaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequestDTO dto) {
        return ResponseEntity.ok(categoriaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        categoriaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
