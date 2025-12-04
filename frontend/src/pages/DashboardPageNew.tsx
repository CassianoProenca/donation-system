/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  IconPackage,
  IconBox,
  IconTrendingUp,
  IconUsers,
  IconArrowUpRight,
  IconArrowDown,
  IconArrowUp,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { categoriaService } from "@/services/categoriaService";
import { produtoService } from "@/services/produtoService";
import { loteService } from "@/services/loteService";
import { movimentacaoService } from "@/services/movimentacaoService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    categorias: 0,
    produtos: 0,
    lotes: 0,
    movimentacoesHoje: 0,
    estoqueTotal: 0,
  });
  const [categoriaData, setCategoriaData] = useState<any[]>([]);
  const [movimentacaoData, setMovimentacaoData] = useState<any[]>([]);
  const [tipoMovimentacaoData, setTipoMovimentacaoData] = useState<any[]>([]);
  const [ultimasMovimentacoes, setUltimasMovimentacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const extrairLista = (resposta: any) => {
    if (Array.isArray(resposta)) return resposta;
    if (resposta && Array.isArray(resposta.content)) return resposta.content;
    return [];
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [categoriasData, produtosData, lotesData, movimentacoesData] =
        await Promise.all([
          categoriaService.getAll("?size=1000", 0, 1000),
          produtoService.getAll("?size=1000", 0, 1000),
          loteService.getAll("?size=1000", 0, 1000),
          movimentacaoService.getAll("?size=1000", 0, 1000),
        ]);

      const categorias = extrairLista(categoriasData);
      const produtos = extrairLista(produtosData);
      const lotes = extrairLista(lotesData);
      const movimentacoes = extrairLista(movimentacoesData);

      const hoje = new Date().toISOString().split("T")[0];
      const movimentacoesHoje = movimentacoes.filter((m: any) =>
        m.dataHora.startsWith(hoje)
      ).length;

      const estoqueTotal = lotes.reduce(
        (sum: number, lote: any) => sum + lote.quantidadeAtual,
        0
      );

      setStats({
        categorias: categorias.length,
        produtos: produtos.length,
        lotes: lotes.length,
        movimentacoesHoje,
        estoqueTotal,
      });

      const movPorDiaMap: Record<string, number> = {};

      movimentacoes.forEach((mov: any) => {
        const dia = mov.dataHora.split("T")[0];
        movPorDiaMap[dia] = (movPorDiaMap[dia] || 0) + 1;
      });

      const chartColors = [
        "#3b82f6", // Azul
        "#10b981", // Verde
        "#f59e0b", // Laranja
        "#ef4444", // Vermelho
        "#8b5cf6", // Roxo
        "#06b6d4", // Ciano
        "#ec4899", // Rosa
        "#14b8a6", // Teal
        "#f97316", // Laranja escuro
        "#6366f1", // Índigo
      ];

      setCategoriaData(
        Object.entries(movPorDiaMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([dia, count], index) => ({
            tipo: new Date(dia).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            quantidade: count,
            fill: chartColors[index % chartColors.length],
          }))
      );

      const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
        const data = new Date();
        data.setDate(data.getDate() - (6 - i));
        return data.toISOString().split("T")[0];
      });

      const movPorDia = ultimos7Dias.map((dia) => {
        const movsDia = movimentacoes.filter((m: any) =>
          m.dataHora.startsWith(dia)
        );
        return {
          dia: new Date(dia).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          quantidade: movsDia.length,
          entradas: movsDia.filter((m: any) => m.tipo === "ENTRADA").length,
          saidas: movsDia.filter((m: any) => m.tipo === "SAIDA").length,
        };
      });

      setMovimentacaoData(movPorDia);

      const tipoMovCount: Record<string, number> = {
        ENTRADA: 0,
        SAIDA: 0,
        AJUSTE_PERDA: 0,
        AJUSTE_GANHO: 0,
      };

      movimentacoes.forEach((m: any) => {
        if (tipoMovCount[m.tipo] !== undefined) {
          tipoMovCount[m.tipo]++;
        }
      });

      const tipoMovLabels: Record<string, string> = {
        ENTRADA: "Entradas",
        SAIDA: "Saídas",
        AJUSTE_PERDA: "Perdas",
        AJUSTE_GANHO: "Ganhos",
      };

      setTipoMovimentacaoData(
        Object.entries(tipoMovCount).map(([tipo, count]) => ({
          tipo: tipoMovLabels[tipo] || tipo,
          quantidade: count,
        }))
      );

      const ultimasMovs = movimentacoes
        .sort(
          (a: any, b: any) =>
            new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
        )
        .slice(0, 10);
      setUltimasMovimentacoes(ultimasMovs);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6 max-w-[1600px] mx-auto">
              <div className="border-b pb-6">
                <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                <p className="text-muted-foreground">Bem-vindo, {user?.nome}</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Carregando dados...
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="bg-blue-500/10 p-3 rounded-xl">
                            <IconBox className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                              Estoque
                            </div>
                            <div className="text-2xl font-bold mt-1">
                              {stats.estoqueTotal.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Unidades totais
                          </span>
                          <div className="flex items-center text-xs text-green-600 font-medium">
                            <IconArrowUpRight className="h-3 w-3 mr-1" />
                            Estável
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="bg-purple-500/10 p-3 rounded-xl">
                            <IconPackage className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                              Produtos
                            </div>
                            <div className="text-2xl font-bold mt-1">
                              {stats.produtos}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {stats.categorias} categorias
                          </span>
                          <div className="flex items-center text-xs text-green-600 font-medium">
                            <IconArrowUpRight className="h-3 w-3 mr-1" />
                            Ativo
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="bg-orange-500/10 p-3 rounded-xl">
                            <IconTrendingUp className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                              Lotes
                            </div>
                            <div className="text-2xl font-bold mt-1">
                              {stats.lotes}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Em controle
                          </span>
                          <div className="flex items-center text-xs text-green-600 font-medium">
                            <IconArrowUpRight className="h-3 w-3 mr-1" />
                            OK
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="bg-green-500/10 p-3 rounded-xl">
                            <IconUsers className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                              Hoje
                            </div>
                            <div className="text-2xl font-bold mt-1">
                              {stats.movimentacoesHoje}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Movimentações
                          </span>
                          <div className="flex items-center text-xs text-green-600 font-medium">
                            <IconArrowUpRight className="h-3 w-3 mr-1" />
                            Ativo
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Histórico de Movimentações */}
                  <Card className="shadow-sm">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            Histórico de Movimentações
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Últimas 10 movimentações registradas no sistema
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data/Hora</TableHead>
                              <TableHead>Produto</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead className="text-right">
                                Quantidade
                              </TableHead>
                              <TableHead>Usuário</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ultimasMovimentacoes.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center text-muted-foreground"
                                >
                                  Nenhuma movimentação registrada
                                </TableCell>
                              </TableRow>
                            ) : (
                              ultimasMovimentacoes.map((mov) => (
                                <TableRow key={mov.id}>
                                  <TableCell className="font-medium">
                                    {new Date(mov.dataHora).toLocaleString(
                                      "pt-BR",
                                      {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {mov.lote?.itens?.length > 0
                                      ? mov.lote.itens[0].produtoNome +
                                        (mov.lote.itens.length > 1
                                          ? ` +${mov.lote.itens.length - 1}`
                                          : "")
                                      : mov.lote?.produtoNome || "-"}
                                  </TableCell>
                                  <TableCell>
                                    {mov.tipo === "ENTRADA" && (
                                      <Badge
                                        variant="default"
                                        className="gap-1"
                                      >
                                        <IconArrowDown className="h-3 w-3" />
                                        Entrada
                                      </Badge>
                                    )}
                                    {mov.tipo === "SAIDA" && (
                                      <Badge
                                        variant="destructive"
                                        className="gap-1"
                                      >
                                        <IconArrowUp className="h-3 w-3" />
                                        Saída
                                      </Badge>
                                    )}
                                    {mov.tipo === "AJUSTE_PERDA" && (
                                      <Badge
                                        variant="outline"
                                        className="gap-1"
                                      >
                                        Perda
                                      </Badge>
                                    )}
                                    {mov.tipo === "AJUSTE_GANHO" && (
                                      <Badge
                                        variant="secondary"
                                        className="gap-1"
                                      >
                                        Ganho
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {mov.tipo === "ENTRADA" ||
                                    mov.tipo === "AJUSTE_GANHO" ? (
                                      <span className="text-green-600">
                                        +{mov.quantidade}
                                      </span>
                                    ) : (
                                      <span className="text-red-600">
                                        -{mov.quantidade}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {mov.usuario?.nome || "Sistema"}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="shadow-sm">
                      <CardHeader className="border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="h-8 w-1 bg-linear-to-b from-blue-500 to-purple-500 rounded-full" />
                          Dias com Mais Movimentações
                        </CardTitle>
                        <CardDescription>
                          Top 10 dias com maior volume de movimentações
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <ChartContainer
                          config={{
                            quantidade: {
                              label: "Movimentações",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                          className="h-[280px]"
                        >
                          <BarChart data={categoriaData} layout="vertical">
                            <CartesianGrid
                              strokeDasharray="3 3"
                              horizontal={false}
                              stroke="hsl(var(--border))"
                            />
                            <XAxis
                              type="number"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              dataKey="tipo"
                              type="category"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              width={100}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="quantidade" radius={[0, 8, 8, 0]}>
                              {categoriaData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="h-8 w-1 bg-linear-to-b from-orange-500 to-red-500 rounded-full" />
                          Movimentações por Tipo
                        </CardTitle>
                        <CardDescription>
                          Total de movimentações registradas
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {tipoMovimentacaoData.map((item, index) => {
                            const total = tipoMovimentacaoData.reduce(
                              (sum, i) => sum + i.quantidade,
                              0
                            );
                            const percentage =
                              total > 0 ? (item.quantidade / total) * 100 : 0;
                            const colors = [
                              "bg-blue-500",
                              "bg-red-500",
                              "bg-orange-500",
                              "bg-green-500",
                            ];
                            return (
                              <div key={item.tipo} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">
                                    {item.tipo}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {item.quantidade}
                                  </span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      colors[index % colors.length]
                                    } transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
