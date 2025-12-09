package com.ong.backend.controllers;

import com.ong.backend.dto.dashboard.DashboardMetricsDTO;
import com.ong.backend.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTARIO')")
    public ResponseEntity<DashboardMetricsDTO> obterMetricas() {
        return ResponseEntity.ok(dashboardService.obterMetricas());
    }
}

