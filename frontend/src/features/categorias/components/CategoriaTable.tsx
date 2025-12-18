import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { Categoria } from "../types";
import { LoadingSpinner, EmptyState } from "@/shared/components/data-display";

interface CategoriaTableProps {
  categorias: Categoria[];
  isLoading: boolean;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
}

export function CategoriaTable({
  categorias,
  isLoading,
  onEdit,
  onDelete,
}: CategoriaTableProps) {
  if (isLoading) {
    return <LoadingSpinner text="Carregando categorias..." />;
  }

  if (!categorias || categorias.length === 0) {
    return (
      <EmptyState
        title="Nenhuma categoria encontrada"
        description="Cadastre a primeira categoria para começar."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Ícone</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias.map((categoria) => (
            <TableRow key={categoria.id}>
              <TableCell className="text-2xl">{categoria.icone || "-"}</TableCell>
              <TableCell className="font-medium">{categoria.nome}</TableCell>
              <TableCell>{categoria.descricao || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(categoria)}
                  >
                    <IconEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(categoria.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
