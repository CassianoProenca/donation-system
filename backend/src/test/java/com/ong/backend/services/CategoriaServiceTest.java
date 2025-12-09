package com.ong.backend.services;

import com.ong.backend.dto.categoria.CategoriaRequestDTO;
import com.ong.backend.dto.categoria.CategoriaResponseDTO;
import com.ong.backend.exceptions.BusinessException;
import com.ong.backend.exceptions.ResourceNotFoundException;
import com.ong.backend.models.Categoria;
import com.ong.backend.repositories.CategoriaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do CategoriaService")
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private CategoriaService categoriaService;

    private Categoria categoria;
    private CategoriaRequestDTO categoriaRequestDTO;

    @BeforeEach
    void setUp() {
        categoria = new Categoria();
        categoria.setId(1L);
        categoria.setNome("Alimentos");
        categoria.setDescricao("Produtos alimentícios");
        categoria.setIcone("🍚");

        categoriaRequestDTO = new CategoriaRequestDTO(
                "Alimentos",
                "Produtos alimentícios",
                "🍚"
        );
    }

    @Test
    @DisplayName("Deve listar todas as categorias")
    void deveListarTodasCategorias() {
        // Given
        Categoria categoria2 = new Categoria();
        categoria2.setId(2L);
        categoria2.setNome("Roupas");

        when(categoriaRepository.findAll()).thenReturn(Arrays.asList(categoria, categoria2));

        // When
        List<CategoriaResponseDTO> resultado = categoriaService.listarTodas();

        // Then
        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        verify(categoriaRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve buscar categoria por ID com sucesso")
    void deveBuscarCategoriaPorId() {
        // Given
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));

        // When
        CategoriaResponseDTO resultado = categoriaService.buscarPorId(1L);

        // Then
        assertNotNull(resultado);
        assertEquals(1L, resultado.id());
        assertEquals("Alimentos", resultado.nome());
        verify(categoriaRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Deve lançar exceção quando categoria não encontrada")
    void deveLancarExcecaoQuandoCategoriaNaoEncontrada() {
        // Given
        when(categoriaRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            categoriaService.buscarPorId(999L);
        });
    }

    @Test
    @DisplayName("Deve criar categoria com sucesso")
    void deveCriarCategoria() {
        // Given
        when(categoriaRepository.existsByNome("Alimentos")).thenReturn(false);
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoria);

        // When
        CategoriaResponseDTO resultado = categoriaService.criar(categoriaRequestDTO);

        // Then
        assertNotNull(resultado);
        assertEquals(1L, resultado.id());
        assertEquals("Alimentos", resultado.nome());
        verify(categoriaRepository, times(1)).existsByNome("Alimentos");
        verify(categoriaRepository, times(1)).save(any(Categoria.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao criar categoria duplicada")
    void deveLancarExcecaoAoCriarCategoriaDuplicada() {
        // Given
        when(categoriaRepository.existsByNome("Alimentos")).thenReturn(true);

        // When & Then
        assertThrows(BusinessException.class, () -> {
            categoriaService.criar(categoriaRequestDTO);
        });
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve atualizar categoria com sucesso")
    void deveAtualizarCategoria() {
        // Given
        CategoriaRequestDTO dtoAtualizado = new CategoriaRequestDTO(
                "Alimentos Atualizados",
                "Nova descrição",
                "🍔"
        );

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(categoriaRepository.existsByNome("Alimentos Atualizados")).thenReturn(false);
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoria);

        // When
        CategoriaResponseDTO resultado = categoriaService.atualizar(1L, dtoAtualizado);

        // Then
        assertNotNull(resultado);
        verify(categoriaRepository, times(1)).findById(1L);
        verify(categoriaRepository, times(1)).save(any(Categoria.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao atualizar com nome duplicado")
    void deveLancarExcecaoAoAtualizarComNomeDuplicado() {
        // Given
        CategoriaRequestDTO dtoAtualizado = new CategoriaRequestDTO(
                "Roupas",
                "Descrição",
                "👔"
        );

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(categoriaRepository.existsByNome("Roupas")).thenReturn(true);

        // When & Then
        assertThrows(BusinessException.class, () -> {
            categoriaService.atualizar(1L, dtoAtualizado);
        });
    }

    @Test
    @DisplayName("Deve deletar categoria com sucesso")
    void deveDeletarCategoria() {
        // Given
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        doNothing().when(categoriaRepository).delete(categoria);

        // When
        categoriaService.deletar(1L);

        // Then
        verify(categoriaRepository, times(1)).findById(1L);
        verify(categoriaRepository, times(1)).delete(categoria);
    }

    @Test
    @DisplayName("Deve lançar exceção ao deletar categoria inexistente")
    void deveLancarExcecaoAoDeletarCategoriaInexistente() {
        // Given
        when(categoriaRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            categoriaService.deletar(999L);
        });
        verify(categoriaRepository, never()).delete(any(Categoria.class));
    }
}

