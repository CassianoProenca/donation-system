

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { Produto, Categoria, ProdutoFormData } from "../types";

interface ProdutoFormProps {
  produto?: Produto | null;
  categorias: Categoria[];
  produtos: Produto[];
  onSubmit: (data: ProdutoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ComponenteForm {
  produtoId: string;
  quantidade: string;
}

export function ProdutoForm({
  produto,
  categorias,
  produtos,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProdutoFormProps) {
  const [formData, setFormData] = useState(() => {
    if (produto) {
      return {
        nome: produto.nome,
        descricao: produto.descricao || "",
        codigoBarrasFabricante: produto.codigoBarrasFabricante || "",
        categoriaId: produto.categoria?.id?.toString() || "",
        isKit: produto.isKit,
      };
    }
    return {
      nome: "",
      descricao: "",
      codigoBarrasFabricante: "",
      categoriaId: "",
      isKit: false,
    };
  });

  const [componentes, setComponentes] = useState<ComponenteForm[]>(() => {
    if (
      produto?.isKit &&
      produto.componentes &&
      produto.componentes.length > 0
    ) {
      return produto.componentes.map((c) => ({
        produtoId: c.produtoId.toString(),
        quantidade: c.quantidade.toString(),
      }));
    }
    return [{ produtoId: "", quantidade: "" }];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      return;
    }
    if (!formData.categoriaId) {
      return;
    }

    const data: ProdutoFormData = {
      nome: formData.nome,
      descricao: formData.descricao || undefined,
      codigoBarrasFabricante: formData.codigoBarrasFabricante || undefined,
      categoriaId: Number(formData.categoriaId),
      isKit: formData.isKit,
    };

    if (formData.isKit) {
      const componentesValidos = componentes
        .filter((c) => c.produtoId && c.quantidade)
        .map((c) => ({
          produtoId: Number(c.produtoId),
          quantidade: Number(c.quantidade),
        }));

      if (componentesValidos.length === 0) {
        return;
      }

      data.componentes = componentesValidos;
    }

    onSubmit(data);
  };

  const addComponente = () => {
    setComponentes([...componentes, { produtoId: "", quantidade: "" }]);
  };

  const removeComponente = (index: number) => {
    if (componentes.length > 1) {
      setComponentes(componentes.filter((_, i) => i !== index));
    }
  };

  const updateComponente = (
    index: number,
    field: "produtoId" | "quantidade",
    value: string
  ) => {
    const novos = [...componentes];
    novos[index] = { ...novos[index], [field]: value };
    setComponentes(novos);
  };

  const produtosDisponiveis = produtos.filter(
    (p) => !p.isKit && (!produto || p.id !== produto.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Nome do produto"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) =>
            setFormData({ ...formData, descricao: e.target.value })
          }
          placeholder="Descrição do produto"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="codigoBarras">Código de Barras</Label>
        <Input
          id="codigoBarras"
          value={formData.codigoBarrasFabricante}
          onChange={(e) =>
            setFormData({ ...formData, codigoBarrasFabricante: e.target.value })
          }
          placeholder="Código de barras do fabricante"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria">Categoria *</Label>
        <Select
          value={formData.categoriaId}
          onValueChange={(value) =>
            setFormData({ ...formData, categoriaId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isKit"
          checked={formData.isKit}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isKit: checked as boolean })
          }
        />
        <Label htmlFor="isKit" className="cursor-pointer">
          Este produto é um kit (conjunto de produtos)
        </Label>
      </div>

      {formData.isKit && (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Label>Componentes do Kit *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addComponente}
            >
              <IconPlus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {componentes.map((componente, index) => (
              <div key={index} className="flex gap-2">
                <Select
                  value={componente.produtoId}
                  onValueChange={(value) =>
                    updateComponente(index, "produtoId", value)
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtosDisponiveis.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  value={componente.quantidade}
                  onChange={(e) =>
                    updateComponente(index, "quantidade", e.target.value)
                  }
                  placeholder="Qtd"
                  className="w-24"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeComponente(index)}
                  disabled={componentes.length === 1}
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : produto ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
