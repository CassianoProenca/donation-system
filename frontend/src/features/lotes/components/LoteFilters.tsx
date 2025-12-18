import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconFilter, IconX } from "@tabler/icons-react";
import { useProdutosSimples } from "@/features/produtos/api";
import type { LoteFilters } from "../types";

interface LoteFiltersProps {
  tempFilters: LoteFilters;
  onFilterChange: (filters: LoteFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

export function LoteFiltersComponent({
  tempFilters,
  onFilterChange,
  onApply,
  onReset,
}: LoteFiltersProps) {
  const { data: produtos } = useProdutosSimples();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <IconFilter className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
          <DialogDescription>
            Aplique filtros para refinar sua pesquisa
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Produto</Label>
            <Select
              value={tempFilters.produtoId?.toString() || ""}
              onValueChange={(value) =>
                onFilterChange({
                  ...tempFilters,
                  produtoId: value ? parseInt(value) : undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os produtos" />
              </SelectTrigger>
              <SelectContent>
                {produtos?.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id.toString()}>
                    {produto.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Data Entrada (Início)</Label>
            <Input
              type="date"
              value={tempFilters.dataEntradaInicio || ""}
              onChange={(e) =>
                onFilterChange({
                  ...tempFilters,
                  dataEntradaInicio: e.target.value,
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Data Entrada (Fim)</Label>
            <Input
              type="date"
              value={tempFilters.dataEntradaFim || ""}
              onChange={(e) =>
                onFilterChange({
                  ...tempFilters,
                  dataEntradaFim: e.target.value,
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Validade (Início)</Label>
            <Input
              type="date"
              value={tempFilters.dataValidadeInicio || ""}
              onChange={(e) =>
                onFilterChange({
                  ...tempFilters,
                  dataValidadeInicio: e.target.value,
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Validade (Fim)</Label>
            <Input
              type="date"
              value={tempFilters.dataValidadeFim || ""}
              onChange={(e) =>
                onFilterChange({
                  ...tempFilters,
                  dataValidadeFim: e.target.value,
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Estoque</Label>
            <Select
              value={
                tempFilters.comEstoque === undefined
                  ? ""
                  : tempFilters.comEstoque.toString()
              }
              onValueChange={(value) =>
                onFilterChange({
                  ...tempFilters,
                  comEstoque: value === "" ? undefined : value === "true",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Com estoque</SelectItem>
                <SelectItem value="false">Sem estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onReset}>
            <IconX className="mr-2 h-4 w-4" />
            Limpar
          </Button>
          <Button onClick={onApply}>Aplicar Filtros</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
