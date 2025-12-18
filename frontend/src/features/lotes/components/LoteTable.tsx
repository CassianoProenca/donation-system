import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconEdit,
  IconTrash,
  IconPackage,
  IconCalendar,
  IconPrinter,
} from "@tabler/icons-react";
import { LoadingSpinner } from "@/shared/components/data-display/LoadingSpinner";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { formatDate } from "@/shared/lib/formatters";
import type { LoteResponse } from "../types";
import { PdfPreviewDialog } from "@/shared/components/data-display/PdfPreviewDialog";
import { etiquetaService } from "@/services/etiquetaService";
import { useState } from "react";
import { toast } from "sonner";

interface LoteTableProps {
  lotes: LoteResponse[];
  isLoading: boolean;
  onEdit: (lote: LoteResponse) => void;
  onDelete: (id: number) => void;
}

export function LoteTable({
  lotes,
  isLoading,
  onEdit,
  onDelete,
}: LoteTableProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);

  const handlePrint = async (id: number) => {
    try {
      setPrintingId(id);
      const blob = await etiquetaService.obterLotePDFBlob([id]);
      setPdfBlob(blob);
      setPreviewOpen(true);
    } catch {
      toast.error("Erro ao gerar etiqueta");
    } finally {
      setPrintingId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (lotes.length === 0) {
    return <EmptyState title="Nenhum lote encontrado" />;
  }

  const getEstoqueColor = (
    quantidadeAtual: number,
    quantidadeInicial: number
  ) => {
    const percentual = (quantidadeAtual / quantidadeInicial) * 100;
    if (percentual === 0) return "destructive";
    if (percentual <= 25) return "destructive";
    if (percentual <= 50) return "secondary";
    return "default";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produtos</TableHead>
            <TableHead>Data Entrada</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lotes.map((lote) => (
            <TableRow key={lote.id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {lote.itens.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <IconPackage className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.produtoNome}</span>
                      <span className="text-muted-foreground">
                        ({item.quantidade}x)
                      </span>
                      {item.dataValidade && (
                        <Badge variant="outline" className="gap-1">
                          <IconCalendar className="h-3 w-3" />
                          {formatDate(item.dataValidade)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>{formatDate(lote.dataEntrada)}</TableCell>
              <TableCell>
                <Badge
                  variant={getEstoqueColor(
                    lote.quantidadeAtual,
                    lote.quantidadeInicial
                  )}
                >
                  {lote.quantidadeAtual} / {lote.quantidadeInicial}
                </Badge>
              </TableCell>
              <TableCell>{lote.unidadeMedida}</TableCell>
              <TableCell className="max-w-xs truncate">
                {lote.observacoes || "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePrint(lote.id)}
                    disabled={printingId === lote.id}
                    title="Visualizar Etiquetas"
                  >
                    <IconPrinter className={`h-4 w-4 ${printingId === lote.id ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(lote)}
                  >
                    <IconEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(lote.id)}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PdfPreviewDialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pdfBlob={pdfBlob}
        title="Visualização de Etiquetas"
      />
    </div>
  );
}
