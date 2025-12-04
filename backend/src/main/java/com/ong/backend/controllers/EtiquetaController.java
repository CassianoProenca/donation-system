package com.ong.backend.controllers;

import com.ong.backend.services.EtiquetaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etiquetas")
@RequiredArgsConstructor
public class EtiquetaController {

    private final EtiquetaService etiquetaService;

    @PostMapping("/imprimir-lote")
    public ResponseEntity<byte[]> imprimirEtiquetasEmLote(@RequestBody List<Long> loteIds) {
        try {
            byte[] pdf = etiquetaService.gerarEtiquetasEmLotePDF(loteIds);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "etiquetas-lote.pdf");

            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/lote/{loteId}")
    public ResponseEntity<byte[]> gerarEtiqueta(@PathVariable Long loteId,
            @RequestParam(required = false) String tamanho) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}