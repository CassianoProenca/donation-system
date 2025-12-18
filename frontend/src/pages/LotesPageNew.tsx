import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { addDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { PageCard } from "@/shared/components/layout/PageCard";
import { SearchInput } from "@/shared/components/forms/SearchInput";
import { Pagination } from "@/shared/components/data-display/Pagination";
import { usePagination } from "@/shared/hooks/usePagination";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { IconX, IconAlertTriangle } from "@tabler/icons-react";
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
  LoteTable,
  LoteFiltersComponent,
  LoteDialog,
} from "@/features/lotes/components";
import { useLotes, useDeleteLote } from "@/features/lotes/api";
import { useLoteFilters, useLoteDialog } from "@/features/lotes/hooks";

export function LotesPageNew() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, pageSize, goToPage, setPageSize } = usePagination();
  const {
    filters,
    tempFilters,
    setTempFilters,
    setFilters,
    applyFilters,
    resetFilters,
    clearFilter,
  } = useLoteFilters();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);
  const [alertFilter, setAlertFilter] = useState<string | null>(null);

  // Aplicar filtros automaticamente quando vindo do dashboard
  useEffect(() => {
    const filtro = searchParams.get('filtro');
    if (filtro === 'vencendo') {
      const hoje = format(new Date(), "yyyy-MM-dd");
      const horizonte = format(addDays(new Date(), 30), "yyyy-MM-dd");
      const alertaFilters = {
        dataValidadeInicio: hoje,
        dataValidadeFim: horizonte,
        comEstoque: true,
      };
      setFilters((prev) => ({ ...prev, ...alertaFilters }));
      setTempFilters((prev) => ({ ...prev, ...alertaFilters }));
      setAlertFilter('vencendo');
      setSearchParams({});
    }
  }, [searchParams, setFilters, setTempFilters, setSearchParams]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, busca: debouncedSearch || undefined }));
  }, [debouncedSearch, setFilters]);

  const { data, isLoading } = useLotes(
    { ...filters, busca: debouncedSearch || undefined },
    { page, size: pageSize }
  );

  const { isOpen, editingLote, openCreate, openEdit, close } = useLoteDialog();
  const deleteMutation = useDeleteLote();

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
        title="Lotes"
        description="Gerencie os lotes de entrada de produtos"
        actions={
          <Button onClick={openCreate}>
            <IconPlus className="mr-2 h-4 w-4" />
            Novo Lote
          </Button>
        }
      >
        <div className="space-y-4">
          {alertFilter === 'vencendo' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <IconAlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-destructive mb-1">Lotes Vencendo em 30 Dias</h4>
                <p className="text-sm text-muted-foreground">Mostrando apenas lotes com validade nos próximos 30 dias. {' '}
                  <button 
                    onClick={() => {
                      resetFilters();
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
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar lotes..."
              />
            </div>
            <LoteFiltersComponent
              tempFilters={tempFilters}
              onFilterChange={setTempFilters}
              onApply={applyFilters}
              onReset={resetFilters}
            />
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.produtoId && (
                <Badge variant="secondary" className="gap-1">
                  Produto: {filters.produtoId}
                  <button
                    onClick={() => clearFilter("produtoId")}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dataEntradaInicio && (
                <Badge variant="secondary" className="gap-1">
                  Data Início: {filters.dataEntradaInicio}
                  <button
                    onClick={() => clearFilter("dataEntradaInicio")}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dataEntradaFim && (
                <Badge variant="secondary" className="gap-1">
                  Data Fim: {filters.dataEntradaFim}
                  <button
                    onClick={() => clearFilter("dataEntradaFim")}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dataValidadeInicio && (
                <Badge variant="secondary" className="gap-1">
                  Validade Início: {filters.dataValidadeInicio}
                  <button
                    onClick={() => clearFilter("dataValidadeInicio")}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dataValidadeFim && (
                <Badge variant="secondary" className="gap-1">
                  Validade Fim: {filters.dataValidadeFim}
                  <button
                    onClick={() => clearFilter("dataValidadeFim")}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.comEstoque !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  {filters.comEstoque ? "Com estoque" : "Sem estoque"}
                  <button
                    onClick={() => clearFilter("comEstoque")}
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

          <LoteTable
            lotes={data?.content || []}
            isLoading={isLoading}
            onEdit={openEdit}
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

      <LoteDialog isOpen={isOpen} onClose={close} editingLote={editingLote} />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lote? Esta ação não pode ser
              desfeita.
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
