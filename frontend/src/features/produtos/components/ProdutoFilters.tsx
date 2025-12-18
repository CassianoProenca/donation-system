
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchInput } from "@/shared/components/forms";
import { IconFilter, IconX } from "@tabler/icons-react";
import type { ProdutoFilters } from "../types";
import type { Categoria } from "../types";

interface ProdutoFiltersProps {
  filters: ProdutoFilters;
  categorias: Categoria[];
  onFilterChange: <K extends keyof ProdutoFilters>(
    key: K,
    value: ProdutoFilters[K]
  ) => void;
  onClear: () => void;
  onSearch: () => void;
}

export function ProdutoFiltersComponent({
  filters,
  categorias,
  onFilterChange,
  onClear,
  onSearch,
}: ProdutoFiltersProps) {
  const hasActiveFilters = filters.nome || filters.categoriaId !== undefined;

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <IconFilter className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Filtros</h3>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchInput
            value={filters.nome || ""}
            onChange={(value) => onFilterChange("nome", value)}
            onSearch={onSearch}
            placeholder="Buscar por nome..."
          />
        </div>

        <Select
          value={filters.categoriaId?.toString() || "TODOS"}
          onValueChange={(value) => {
            const newValue = value === "TODOS" ? undefined : Number(value);
            onFilterChange("categoriaId", newValue);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue>
              {filters.categoriaId
                ? (() => {
                    const cat = categorias.find(
                      (c) => c.id === filters.categoriaId
                    );
                    return cat
                      ? `${cat.icone ? cat.icone + " " : ""}${cat.nome}`
                      : "Categoria";
                  })()
                : "Todas"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todas</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={`cat-${cat.id}`} value={String(cat.id)}>
                {cat.icone ? `${cat.icone} ` : ""}
                {cat.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={onSearch} size="sm">
          Buscar
        </Button>

        {hasActiveFilters && (
          <Button variant="outline" size="icon" onClick={onClear}>
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Apenas estoque crítico</p>
            <p className="text-xs text-muted-foreground">Produtos abaixo de 10 unidades</p>
          </div>
          <Checkbox
            checked={!!filters.estoqueCritico}
            onCheckedChange={(checked: boolean) => onFilterChange("estoqueCritico", checked)}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Somente com estoque</p>
            <p className="text-xs text-muted-foreground">Oculta itens zerados</p>
          </div>
          <Checkbox
            checked={!!filters.somenteComEstoque}
            onCheckedChange={(checked: boolean) => onFilterChange("somenteComEstoque", checked)}
          />
        </div>
      </div>
    </div>
  );
}
