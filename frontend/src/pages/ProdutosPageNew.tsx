
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconPlus, IconX, IconAlertTriangle } from "@tabler/icons-react";
import { PageCard } from "@/shared/components/layout";
import { Pagination } from "@/shared/components/data-display";
import { usePagination } from "@/shared/hooks";
import {
  useProdutos,
  useDeleteProduto,
  useProdutoFilters,
  useProdutoDialog,
  ProdutoTable,
  ProdutoFiltersComponent,
  ProdutoDialog,
} from "@/features/produtos";

import { useCategoriasSimples } from "@/features/categorias";

export function ProdutosPageNew() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { filters, activeFilters, updateFilter, updateFilters, applyFilters, clearFilters, setFilters } =
    useProdutoFilters();
  const { isOpen, editingProduto, openCreate, openEdit, close } =
    useProdutoDialog();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [alertFilter, setAlertFilter] = useState<string | null>(null);

  // Aplicar filtros automaticamente quando vindo do dashboard
  useEffect(() => {
    const filtro = searchParams.get('filtro');
    if (filtro === 'estoque-baixo') {
      const alertaFilters: Partial<typeof filters> = {
        estoqueCritico: true,
        somenteComEstoque: true,
      };
      setFilters((prev) => ({ ...prev, ...alertaFilters }));
      updateFilters(alertaFilters);
      setAlertFilter('estoque-baixo');
      setSearchParams({});
      setTimeout(() => applyFilters(), 0);
    }
  }, [searchParams, setFilters, updateFilters, applyFilters, setSearchParams]);

  const { data: produtosData, isLoading: loadingProdutos } = useProdutos(
    activeFilters,
    page,
    pageSize
  );
  const { data: categoriasData } = useCategoriasSimples();

  const deleteMutation = useDeleteProduto();

  const handleSearch = () => {
    setPage(0);
    applyFilters();
  };

  const handleClearFilters = () => {
    clearFilters();
    setAlertFilter(null);
    setSearchParams({});
    setPage(0);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        setDeleteDialogOpen(false);
        setDeletingId(null);
      } catch {
        // Erro já tratado pelo hook
      }
    }
  };

  const produtos = produtosData?.content || [];
  const categorias = categoriasData || [];
  const totalPages = produtosData?.totalPages || 0;
  const totalElements = produtosData?.totalElements || 0;

  const hasActiveFilters =
    !!activeFilters.nome || activeFilters.categoriaId !== undefined || activeFilters.estoqueCritico || activeFilters.somenteComEstoque;
  const categoriaNome = activeFilters.categoriaId
    ? categorias.find((c) => c.id === activeFilters.categoriaId)?.nome
    : null;

  return (
    <>
      <PageCard
        title="Produtos"
        description="Gerencie os produtos do estoque"
        actions={
          <Button onClick={openCreate}>
            <IconPlus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        }
      >
        <div className="space-y-4">
          {alertFilter === 'estoque-baixo' && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
              <IconAlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Produtos com Estoque Crítico</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">Mostrando apenas produtos abaixo da reserva mínima. {' '}
                  <button 
                    onClick={() => {
                      clearFilters();
                      setAlertFilter(null);
                      setSearchParams({});
                    }} 
                    className="text-primary hover:underline font-medium"
                  >
                    Limpar filtro
                  </button>
                </p>
              </div>
            </div>
          )}
          <ProdutoFiltersComponent
            filters={filters}
            categorias={categorias}
            onFilterChange={updateFilter}
            onClear={handleClearFilters}
            onSearch={handleSearch}
          />

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.nome && (
                <Badge variant="secondary" className="gap-1">
                  Nome: {activeFilters.nome}
                  <button
                    onClick={() => {
                      updateFilter("nome", "");
                      applyFilters();
                    }}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {categoriaNome && (
                <Badge variant="secondary" className="gap-1">
                  Categoria: {categoriaNome}
                  <button
                    onClick={() => {
                      updateFilter("categoriaId", undefined);
                      applyFilters();
                    }}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {activeFilters.estoqueCritico && (
                <Badge variant="secondary" className="gap-1">
                  Estoque crítico
                  <button
                    onClick={() => {
                      updateFilter("estoqueCritico", false);
                      applyFilters();
                    }}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {activeFilters.somenteComEstoque && (
                <Badge variant="secondary" className="gap-1">
                  Apenas com estoque
                  <button
                    onClick={() => {
                      updateFilter("somenteComEstoque", false);
                      applyFilters();
                    }}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          <ProdutoTable
            produtos={produtos}
            isLoading={loadingProdutos}
            onEdit={openEdit}
            onDelete={handleDelete}
          />

          {produtosData && produtosData.totalPages > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      </PageCard>

      {/* Dialog de Produto */}
      <ProdutoDialog
        open={isOpen}
        produto={editingProduto}
        categorias={categorias}
        produtos={produtos}
        onClose={close}
      />

      {/* Dialog de Confirmação de Delete */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
