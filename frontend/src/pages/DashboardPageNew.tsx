 
import { useAuth } from "@/features/auth";
import { useDashboardMetrics } from "@/features/dashboard/api/useDashboardMetrics";
import { SkeletonDashboard } from "@/shared/components/Skeleton";
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Line,
  LineChart,
} from "recharts";
import {
  IconPackage,
  IconBox,
  IconTrendingUp,
  IconUsers,
  IconArrowUpRight,
  IconArrowDown,
  IconArrowUp,
  IconAlertTriangle,
  IconClock,
  IconBoxOff,
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

export default function DashboardPageNew() {
  const { user } = useAuth();
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar dashboard</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  const chartColors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
  ];

  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo, {user?.nome}</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Estoque"
          value={metrics.estoqueTotal.toLocaleString()}
          icon={IconBox}
          description="Unidades totais"
        />
        <StatCard
          title="Produtos"
          value={metrics.totalProdutos}
          icon={IconPackage}
          description={`${metrics.totalCategorias} categorias`}
        />
        <StatCard
          title="Lotes"
          value={metrics.totalLotes}
          icon={IconTrendingUp}
          description="Em controle"
        />
        <StatCard
          title="Hoje"
          value={metrics.movimentacoesHoje}
          icon={IconUsers}
          description="Movimentações"
        />
      </div>

      {/* Alertas Críticos */}
      {metrics.alertasCriticos && (
        <Card className="shadow-sm border-orange-200 dark:border-orange-900/30">
          <CardHeader className="border-b bg-orange-50/50 dark:bg-orange-950/20">
            <CardTitle className="text-xl flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <IconAlertTriangle className="h-5 w-5" />
              Alertas Críticos
            </CardTitle>
            <CardDescription>Itens que requerem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <AlertCard
                icon={IconClock}
                value={metrics.alertasCriticos.lotesVencendo}
                label="Lotes vencendo em 7 dias"
                color="red"
              />
              <AlertCard
                icon={IconAlertTriangle}
                value={metrics.alertasCriticos.produtosEstoqueBaixo}
                label="Produtos com estoque baixo"
                color="yellow"
              />
              <AlertCard
                icon={IconBoxOff}
                value={metrics.alertasCriticos.lotesSemEstoque}
                label="Lotes sem estoque"
                color="gray"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evolução do Estoque + Top 5 Produtos */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {metrics.evolucaoEstoque.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-1 bg-linear-to-b from-blue-500 to-cyan-500 rounded-full" />
                Evolução do Estoque (30 dias)
              </CardTitle>
              <CardDescription>
                Acompanhe a variação do estoque total ao longo do mês
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  estoque: {
                    label: "Estoque Total",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <LineChart data={metrics.evolucaoEstoque}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="dia"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="estoque"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {metrics.top5ProdutosMaisDistribuidos.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-1 bg-linear-to-b from-green-500 to-emerald-500 rounded-full" />
                Top 5 Produtos Mais Distribuídos
              </CardTitle>
              <CardDescription>
                Produtos com maior volume de saídas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {metrics.top5ProdutosMaisDistribuidos.map((produto, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{produto.produtoNome}</div>
                        <div className="text-xs text-muted-foreground">
                          Última saída: {produto.ultimaSaida}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {produto.totalSaidas}
                      </div>
                      <div className="text-xs text-muted-foreground">unidades</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead>Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.ultimasMovimentacoes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      Nenhuma movimentação registrada
                    </TableCell>
                  </TableRow>
                ) : (
                  metrics.ultimasMovimentacoes.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="font-medium">{mov.dataHora}</TableCell>
                      <TableCell>{mov.produtoNome}</TableCell>
                      <TableCell>
                        {mov.tipo === "ENTRADA" && (
                          <Badge variant="default" className="gap-1">
                            <IconArrowDown className="h-3 w-3" />
                            Entrada
                          </Badge>
                        )}
                        {mov.tipo === "SAIDA" && (
                          <Badge variant="destructive" className="gap-1">
                            <IconArrowUp className="h-3 w-3" />
                            Saída
                          </Badge>
                        )}
                        {mov.tipo === "AJUSTE_PERDA" && (
                          <Badge variant="outline" className="gap-1">
                            Perda
                          </Badge>
                        )}
                        {mov.tipo === "AJUSTE_GANHO" && (
                          <Badge variant="secondary" className="gap-1">
                            Ganho
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {mov.tipo === "ENTRADA" || mov.tipo === "AJUSTE_GANHO" ? (
                          <span className="text-green-600">+{mov.quantidade}</span>
                        ) : (
                          <span className="text-red-600">-{mov.quantidade}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {mov.usuarioNome}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos Adicionais */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Movimentações por Dia */}
        {metrics.movimentacoesPorDia.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <div className="h-8 w-1 bg-linear-to-b from-blue-500 to-purple-500 rounded-full" />
                Movimentações por Dia (7 dias)
              </CardTitle>
              <CardDescription>
                Últimos 7 dias de movimentações
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
                <BarChart data={metrics.movimentacoesPorDia}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="dia"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quantidade" radius={[8, 8, 0, 0]}>
                    {metrics.movimentacoesPorDia.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Movimentações por Tipo */}
        {metrics.movimentacoesPorTipo.length > 0 && (
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
                {metrics.movimentacoesPorTipo.map((item, index) => {
                  const total = metrics.movimentacoesPorTipo.reduce(
                    (sum, i) => sum + Number(i.quantidade),
                    0
                  );
                  const percentage =
                    total > 0 ? (Number(item.quantidade) / total) * 100 : 0;
                  const colors = [
                    "bg-blue-500",
                    "bg-red-500",
                    "bg-orange-500",
                    "bg-green-500",
                  ];

                  return (
                    <div key={item.tipo} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
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
        )}
      </div>
    </div>
  );
}

// Componentes auxiliares
function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between relative z-10">
          <div className="bg-blue-500/10 p-3 rounded-xl">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {title}
            </div>
            <div className="text-2xl font-bold mt-1">{value}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{description}</span>
          <div className="flex items-center text-xs text-green-600 font-medium">
            <IconArrowUpRight className="h-3 w-3 mr-1" />
            Ativo
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  color: "red" | "yellow" | "gray";
}) {
  const colorClasses = {
    red: "border-red-200 dark:border-red-900/30 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-500",
    yellow:
      "border-yellow-200 dark:border-yellow-900/30 bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-500",
    gray: "border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400",
  };

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
