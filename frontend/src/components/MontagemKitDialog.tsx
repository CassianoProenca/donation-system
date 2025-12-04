import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { produtoService, type Produto } from "@/services/produtoService";
import { movimentacaoService } from "@/services/movimentacaoService";
import { IconBox, IconTools } from "@tabler/icons-react";

interface MontagemKitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MontagemKitDialog({
  open,
  onOpenChange,
  onSuccess,
}: MontagemKitDialogProps) {
  const [kits, setKits] = useState<Produto[]>([]);
  const [selectedKitId, setSelectedKitId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadKits();
    }
  }, [open]);

  const loadKits = async () => {
    try {
      setLoading(true);
      // Pede uma lista grande para filtrar no front, já que não temos endpoint específico de "listarKits"
      const response = await produtoService.getAll("?size=1000", 0, 1000);

      // CORREÇÃO: Extração segura dos dados (paginação ou lista)
      const todosProdutos = Array.isArray(response)
        ? response
        : response.content || [];

      // Filtra apenas o que é KIT
      const apenasKits = todosProdutos.filter(
        (p: any) => p.isKit === true || p.kit === true
      );

      if (apenasKits.length === 0 && todosProdutos.length > 0) {
        // Fallback visual se não tiver kits cadastrados
        // toast.info("Nenhum produto marcado como 'Kit' foi encontrado.");
      }

      setKits(apenasKits);
    } catch (error) {
      console.error("Erro ao carregar kits", error);
      toast.error("Erro ao carregar lista de kits.");
    } finally {
      setLoading(false);
    }
  };

  const handleMontar = async () => {
    if (!selectedKitId || !quantidade) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    try {
      setSaving(true);
      await movimentacaoService.montarKit({
        produtoKitId: Number(selectedKitId),
        quantidade: Number(quantidade),
      });

      toast.success("Kit montado com sucesso! Estoque atualizado.");
      onSuccess();
      onOpenChange(false);

      // Limpa form
      setSelectedKitId("");
      setQuantidade("");
    } catch (error: any) {
      console.error("Erro na montagem", error);
      const msg = error.response?.data?.message || "Erro ao montar kit.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconTools className="h-5 w-5" />
            Montagem de Kits
          </DialogTitle>
          <DialogDescription>
            Selecione o kit para montar. O sistema dará baixa nos componentes
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="kit">Produto (Kit)</Label>
            <Select
              value={selectedKitId}
              onValueChange={setSelectedKitId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loading ? "Carregando..." : "Selecione um Kit"}
                />
              </SelectTrigger>
              <SelectContent>
                {kits.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhum kit disponível
                  </div>
                ) : (
                  kits.map((kit) => (
                    <SelectItem key={kit.id} value={kit.id.toString()}>
                      {kit.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="qtd">Quantidade a montar</Label>
            <div className="relative">
              <IconBox className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="qtd"
                type="number"
                min="1"
                className="pl-9"
                placeholder="Ex: 10"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleMontar} disabled={saving || !selectedKitId}>
            {saving ? "Processando..." : "Confirmar Montagem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
