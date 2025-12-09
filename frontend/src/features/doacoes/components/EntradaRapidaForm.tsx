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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconPlus, IconTrash, IconGift } from "@tabler/icons-react";
import { useProdutosSimples } from "@/features/produtos/api";
import { useRegistrarDoacao } from "../api";
import type { ItemDoacaoRequest, UnidadeMedida } from "../types";

const unidadesMedida: UnidadeMedida[] = [
  "UNIDADE",
  "QUILOGRAMA",
  "LITRO",
  "PACOTE",
  "CAIXA",
];

const unidadeLabels: Record<UnidadeMedida, string> = {
  UNIDADE: "Unidade",
  QUILOGRAMA: "Quilograma (kg)",
  LITRO: "Litro (L)",
  PACOTE: "Pacote",
  CAIXA: "Caixa",
};

export function EntradaRapidaForm() {
  const { data: produtos } = useProdutosSimples();
  const registrarMutation = useRegistrarDoacao();

  const [dataEntrada, setDataEntrada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [itens, setItens] = useState<ItemDoacaoRequest[]>([
    {
      produtoId: 0,
      quantidade: 1,
      unidadeMedida: "UNIDADE",
    },
  ]);

  const adicionarItem = () => {
    setItens([
      ...itens,
      {
        produtoId: 0,
        quantidade: 1,
        unidadeMedida: "UNIDADE",
      },
    ]);
  };

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const atualizarItem = (
    index: number,
    field: keyof ItemDoacaoRequest,
    value: string | number | undefined
  ) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [field]: value };
    setItens(novosItens);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itensValidos = itens.filter(
      (item) => item.produtoId > 0 && item.quantidade > 0
    );

    if (itensValidos.length === 0) {
      return;
    }

    await registrarMutation.mutateAsync({
      itens: itensValidos,
      dataEntrada,
      observacoesGerais: observacoesGerais || undefined,
    });

    setItens([
      {
        produtoId: 0,
        quantidade: 1,
        unidadeMedida: "UNIDADE",
      },
    ]);
    setObservacoesGerais("");
    setDataEntrada(new Date().toISOString().split("T")[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconGift className="h-5 w-5" />
            Informações Gerais da Doação
          </CardTitle>
          <CardDescription>
            Dados aplicados a todos os itens da doação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="dataEntrada">
              Data de Entrada <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dataEntrada"
              type="date"
              value={dataEntrada}
              onChange={(e) => setDataEntrada(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="observacoesGerais">Observações Gerais</Label>
            <Textarea
              id="observacoesGerais"
              placeholder="Ex: Doação da Campanha do Agasalho 2025"
              value={observacoesGerais}
              onChange={(e) => setObservacoesGerais(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Itens da Doação</h3>
          <Button type="button" onClick={adicionarItem} size="sm">
            <IconPlus className="mr-2 h-4 w-4" />
            Adicionar Item
          </Button>
        </div>

        {itens.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>
                        Produto <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={item.produtoId.toString()}
                        onValueChange={(value) =>
                          atualizarItem(index, "produtoId", parseInt(value))
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos?.map((produto) => (
                            <SelectItem
                              key={produto.id}
                              value={produto.id.toString()}
                            >
                              {produto.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>
                        Quantidade <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) =>
                          atualizarItem(
                            index,
                            "quantidade",
                            parseInt(e.target.value) || 1
                          )
                        }
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Unidade de Medida</Label>
                      <Select
                        value={item.unidadeMedida || "UNIDADE"}
                        onValueChange={(value) =>
                          atualizarItem(
                            index,
                            "unidadeMedida",
                            value as UnidadeMedida
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {unidadesMedida.map((unidade) => (
                            <SelectItem key={unidade} value={unidade}>
                              {unidadeLabels[unidade]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Validade</Label>
                      <Input
                        type="date"
                        value={item.validade || ""}
                        onChange={(e) =>
                          atualizarItem(
                            index,
                            "validade",
                            e.target.value || undefined
                          )
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Tamanho</Label>
                      <Input
                        placeholder="Ex: P, M, G"
                        value={item.tamanho || ""}
                        onChange={(e) =>
                          atualizarItem(
                            index,
                            "tamanho",
                            e.target.value || undefined
                          )
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Voltagem</Label>
                      <Input
                        placeholder="Ex: 110V, 220V, Bivolt"
                        value={item.voltagem || ""}
                        onChange={(e) =>
                          atualizarItem(
                            index,
                            "voltagem",
                            e.target.value || undefined
                          )
                        }
                      />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                      <Label>Observações do Item</Label>
                      <Input
                        placeholder="Observações específicas deste item"
                        value={item.observacoesItem || ""}
                        onChange={(e) =>
                          atualizarItem(
                            index,
                            "observacoesItem",
                            e.target.value || undefined
                          )
                        }
                      />
                    </div>
                  </div>

                  {itens.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removerItem(index)}
                      className="text-destructive"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg" disabled={registrarMutation.isPending}>
          {registrarMutation.isPending ? "Registrando..." : "Registrar Doação"}
        </Button>
      </div>
    </form>
  );
}
