package com.ong.backend.config;

import com.ong.backend.models.*;
import com.ong.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;
    private final LoteRepository loteRepository;
    private final LoteItemRepository loteItemRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final ComposicaoProdutoRepository composicaoProdutoRepository;
    private final PasswordEncoder passwordEncoder;
    
    private final Random random = new Random();

    @Override
    public void run(String... args) {
        log.info("🚀 Iniciando população MASSIVA de dados para apresentação...");
        
        List<Usuario> usuarios = initializeUsers();
        List<Categoria> categorias = initializeCategories();
        List<Produto> produtos = initializeProducts(categorias);
        initializeKits(produtos);
        List<Lote> lotes = initializeLotes(produtos, usuarios);
        initializeMovimentacoes(lotes, usuarios);
        
        log.info("✅ População concluída! Sistema pronto para a demo.");
    }

    private List<Usuario> initializeUsers() {
        List<Usuario> usuarios = new ArrayList<>();
        usuarios.add(criarUsuarioSeNaoExistir("Administrador Geral", "admin@ong.com", "admin123", PerfilUsuario.ADMIN));
        usuarios.add(criarUsuarioSeNaoExistir("Coordenadora Maria", "maria@ong.com", "admin123", PerfilUsuario.ADMIN));
        usuarios.add(criarUsuarioSeNaoExistir("Voluntário João", "joao@ong.com", "voluntario123", PerfilUsuario.VOLUNTARIO));
        usuarios.add(criarUsuarioSeNaoExistir("Voluntária Ana", "ana@ong.com", "voluntario123", PerfilUsuario.VOLUNTARIO));
        usuarios.add(criarUsuarioSeNaoExistir("Voluntário Carlos", "carlos@ong.com", "voluntario123", PerfilUsuario.VOLUNTARIO));
        return usuarios;
    }

    private Usuario criarUsuarioSeNaoExistir(String nome, String email, String senha, PerfilUsuario perfil) {
        return usuarioRepository.findByEmail(email).orElseGet(() -> {
            Usuario u = new Usuario();
            u.setNome(nome);
            u.setEmail(email);
            u.setSenha(passwordEncoder.encode(senha));
            u.setPerfil(perfil);
            return usuarioRepository.save(u);
        });
    }

    private List<Categoria> initializeCategories() {
        List<Categoria> cats = new ArrayList<>();
        cats.add(criarCategoriaSeNaoExistir("Alimentos", "Cestas básicas e itens avulsos", "🍎"));
        cats.add(criarCategoriaSeNaoExistir("Higiene", "Produtos de limpeza e asseio pessoal", "🧼"));
        cats.add(criarCategoriaSeNaoExistir("Roupas", "Vestuário adulto e infantil", "👕"));
        cats.add(criarCategoriaSeNaoExistir("Calçados", "Sapatos e tênis", "👟"));
        cats.add(criarCategoriaSeNaoExistir("Escolar", "Cadernos, lápis e mochilas", "📚"));
        cats.add(criarCategoriaSeNaoExistir("Brinquedos", "Brinquedos para todas as idades", "🧸"));
        cats.add(criarCategoriaSeNaoExistir("Eletrônicos", "Computadores e periféricos", "💻"));
        cats.add(criarCategoriaSeNaoExistir("Medicamentos", "Remédios básicos", "💊"));
        return cats;
    }

    private Categoria criarCategoriaSeNaoExistir(String nome, String desc, String icone) {
        return categoriaRepository.findByNome(nome).orElseGet(() -> {
            Categoria c = new Categoria();
            c.setNome(nome);
            c.setDescricao(desc);
            c.setIcone(icone);
            return categoriaRepository.save(c);
        });
    }

    private List<Produto> initializeProducts(List<Categoria> categorias) {
        List<Produto> prods = new ArrayList<>();
        Categoria alimentos = categorias.get(0);
        Categoria higiene = categorias.get(1);
        Categoria roupas = categorias.get(2);
        Categoria escolar = categorias.get(4);

        // Alimentos
        prods.add(criarProduto("Arroz 5kg", "Tipo 1", "78910001", alimentos));
        prods.add(criarProduto("Feijão 1kg", "Carioca", "78910002", alimentos));
        prods.add(criarProduto("Macarrão 500g", "Espaguete", "78910003", alimentos));
        prods.add(criarProduto("Óleo de Soja", "900ml", "78910004", alimentos));
        prods.add(criarProduto("Açúcar 1kg", "Refinado", "78910005", alimentos));
        prods.add(criarProduto("Café 500g", "Moído", "78910006", alimentos));
        prods.add(criarProduto("Leite em Pó", "400g", "78910007", alimentos));

        // Higiene
        prods.add(criarProduto("Sabonete", "90g", "78920001", higiene));
        prods.add(criarProduto("Creme Dental", "90g", "78920002", higiene));
        prods.add(criarProduto("Xampu", "300ml", "78920003", higiene));
        prods.add(criarProduto("Papel Higiênico", "4 rolos", "78920004", higiene));
        prods.add(criarProduto("Detergente", "500ml", "78920005", higiene));

        // Roupas/Calçados
        prods.add(criarProduto("Camiseta Branca", "Algodão", "78930001", roupas));
        prods.add(criarProduto("Calça Jeans", "Masculina", "78930002", roupas));
        prods.add(criarProduto("Agasalho", "Inverno", "78930003", roupas));

        // Escolar
        prods.add(criarProduto("Caderno 96fls", "Espiral", "78940001", escolar));
        prods.add(criarProduto("Caixa de Lápis", "12 cores", "78940002", escolar));
        prods.add(criarProduto("Mochila", "Escolar padrão", "78940003", escolar));

        return prods;
    }

    private Produto criarProduto(String nome, String desc, String ean, Categoria cat) {
        return produtoRepository.findByNomeContainingIgnoreCase(nome).stream()
            .filter(p -> p.getCategoria().getId().equals(cat.getId()))
            .findFirst()
            .orElseGet(() -> {
                Produto p = new Produto();
                p.setNome(nome);
                p.setDescricao(desc);
                p.setCodigoBarrasFabricante(ean);
                p.setCategoria(cat);
                return produtoRepository.save(p);
            });
    }

    private void initializeKits(List<Produto> produtos) {
        Categoria alimentos = produtos.get(0).getCategoria();
        if (produtoRepository.findByNomeContainingIgnoreCase("Cesta Básica").isEmpty()) {
            Produto kit = new Produto();
            kit.setNome("Cesta Básica Família");
            kit.setDescricao("Kit completo de alimentos");
            kit.setCategoria(alimentos);
            kit.setKit(true);
            kit = produtoRepository.save(kit);

            for (int i = 0; i < 4; i++) {
                ComposicaoProduto comp = new ComposicaoProduto();
                comp.setProdutoPai(kit);
                comp.setComponente(produtos.get(i));
                comp.setQuantidade(2);
                composicaoProdutoRepository.save(comp);
            }
        }
    }

    private List<Lote> initializeLotes(List<Produto> produtos, List<Usuario> usuarios) {
        List<Lote> lotes = new ArrayList<>();
        LocalDate hoje = LocalDate.now();

        for (int i = 0; i < 40; i++) {
            Produto p = produtos.get(random.nextInt(produtos.size()));
            int qtd = 10 + random.nextInt(100);
            
            Lote lote = new Lote();
            lote.setQuantidadeInicial(qtd);
            lote.setQuantidadeAtual(qtd);
            lote.setDataEntrada(hoje.minusDays(random.nextInt(60)));
            lote.setUnidadeMedida(UnidadeMedida.UNIDADE);
            lote.setObservacoes("Lote automático " + i);
            lote = loteRepository.save(lote);

            LoteItem item = new LoteItem();
            item.setLote(lote);
            item.setProduto(p);
            item.setQuantidade(qtd);
            // Alguns com validade próxima para testar alertas
            if (i < 5) {
                item.setDataValidade(hoje.plusDays(random.nextInt(15)));
            } else {
                item.setDataValidade(hoje.plusMonths(6 + random.nextInt(12)));
            }
            loteItemRepository.save(item);
            lotes.add(lote);
            
            // Movimentação de entrada
            Movimentacao m = new Movimentacao();
            m.setLote(lote);
            m.setUsuario(usuarios.get(random.nextInt(usuarios.size())));
            m.setTipo(TipoMovimentacao.ENTRADA);
            m.setQuantidade(qtd);
            m.setDataHora(lote.getDataEntrada().atStartOfDay().plusHours(8));
            movimentacaoRepository.save(m);
        }
        return lotes;
    }

    private void initializeMovimentacoes(List<Lote> lotes, List<Usuario> usuarios) {
        // Criar saídas aleatórias para popular gráficos
        for (int i = 0; i < 30; i++) {
            Lote lote = lotes.get(random.nextInt(lotes.size()));
            if (lote.getQuantidadeAtual() > 5) {
                int saida = 1 + random.nextInt(5);
                
                Movimentacao m = new Movimentacao();
                m.setLote(lote);
                m.setUsuario(usuarios.get(random.nextInt(usuarios.size())));
                m.setTipo(TipoMovimentacao.SAIDA);
                m.setQuantidade(saida);
                m.setDataHora(LocalDateTime.now().minusDays(random.nextInt(15)));
                movimentacaoRepository.save(m);

                lote.setQuantidadeAtual(lote.getQuantidadeAtual() - saida);
                loteRepository.save(lote);
            }
        }
    }
}
