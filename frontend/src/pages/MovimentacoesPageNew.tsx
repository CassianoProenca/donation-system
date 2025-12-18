import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus, IconBox, IconX } from "@tabler/icons-react";
import { PageCard } from "@/shared/components/layout/PageCard";
import { SearchInput } from "@/shared/components/forms/SearchInput";
import { Pagination } from "@/shared/components/data-display/Pagination";
import { usePagination } from "@/shared/hooks/usePagination";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MovimentacaoTable,
  MovimentacaoFiltersComponent,
  MovimentacaoDialog,
  MontagemKitDialog,
} from "@/features/movimentacoes/components";
import {
  useMovimentacoes,
  useDeleteMovimentacao,
} from "@/features/movimentacoes/api";
import {
  useMovimentacaoFilters,
  useMovimentacaoDialog,
} from "@/features/movimentacoes/hooks";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { useDebounce } from "@/shared/hooks/useDebounce";

const tipoLabels: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE_PERDA: "Ajuste Perda",
  AJUSTE_GANHO: "Ajuste Ganho",
};

export function MovimentacoesPageNew() {
  const { page, pageSize, goToPage, setPageSize } = usePagination();
  const {
    filters,
    tempFilters,
    setTempFilters,
    setFilters,
    applyFilters,
    resetFilters,
    clearFilter,
  } = useMovimentacaoFilters();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);

  useEffect(() => {
    setTempFilters((prev) => ({ ...prev, busca: debouncedSearch || undefined }));
    setFilters((prev) => ({ ...prev, busca: debouncedSearch || undefined }));
  }, [debouncedSearch, setFilters, setTempFilters]);

  const { data, isLoading } = useMovimentacoes(filters, {
    page,
    size: pageSize,
  });

  const { isOpen, openCreate, close } = useMovimentacaoDialog();
  const {
    isOpen: isKitDialogOpen,
    open: openKitDialog,
    close: closeKitDialog,
  } = useDisclosure();
  const deleteMutation = useDeleteMovimentacao();

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined && value !== "").length;

  return (
    <>
      <PageCard
        title="Movimentações"
        description="Gerencie as movimentações de estoque"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={openKitDialog}>
              <IconBox className="mr-2 h-4 w-4" />
              Montar Kit
            </Button>
            <Button onClick={openCreate}>
              <IconPlus className="mr-2 h-4 w-4" />
              Nova Movimentação
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar movimentações..."
              />
            </div>
            <MovimentacaoFiltersComponent
              tempFilters={tempFilters}
              onFilterChange={setTempFilters}
              onApply={applyFilters}
              onReset={resetFilters}
            />
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.loteId && (
                <Badge variant="secondary" className="gap-1">
                  Lote: {filters.loteId}
                  <button
                    onClick={() => clearFilter("loteId")}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.tipo && (
                <Badge variant="secondary" className="gap-1">
                  Tipo: {tipoLabels[filters.tipo]}
                  <button
                    onClick={() => clearFilter("tipo")}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dataInicio && (
                <Badge variant="secondary" className="gap-1">
                  Data Início: {filters.dataInicio}
                  <button
                    onClick={() => clearFilter("dataInicio")}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dataFim && (
                <Badge variant="secondary" className="gap-1">
                  Data Fim: {filters.dataFim}
                  <button
                    onClick={() => clearFilter("dataFim")}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.busca && (
                <Badge variant="secondary" className="gap-1">
                  Busca: {filters.busca}
                  <button
                    onClick={() => clearFilter("busca")}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          <MovimentacaoTable
            movimentacoes={data?.content || []}
            isLoading={isLoading}
            onDelete={setDeletingId}
          />

          {data && data.totalPages > 0 && (
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={goToPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      </PageCard>

      <MovimentacaoDialog isOpen={isOpen} onClose={close} />
      <MontagemKitDialog isOpen={isKitDialogOpen} onClose={closeKitDialog} />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta movimentação? Esta ação não
              pode ser desfeita e o estoque será revertido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
