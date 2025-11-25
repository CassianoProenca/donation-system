import { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loteService, type Lote } from '@/services/loteService';
import { IconPrinter } from '@tabler/icons-react';
import { useReactToPrint } from 'react-to-print';

export function EtiquetasPage() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [selectedLoteId, setSelectedLoteId] = useState<string>('');
  const [tamanhoEtiqueta, setTamanhoEtiqueta] = useState<string>('MEDIO');
  const [etiquetaUrl, setEtiquetaUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingEtiqueta, setLoadingEtiqueta] = useState(false);
  const [errorEtiqueta, setErrorEtiqueta] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const loadLotes = async () => {
    try {
      setLoading(true);
      const data = await loteService.getAll();
      setLotes(data);
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLotes();
  }, []);

  const loadEtiqueta = async (loteId: number, tamanho: string) => {
    try {
      setLoadingEtiqueta(true);
      setErrorEtiqueta('');

      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      const response = await fetch(`${baseUrl}/api/etiquetas/lote/${loteId}?tamanho=${tamanho}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }); if (!response.ok) {
        throw new Error('Erro ao carregar etiqueta');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      if (etiquetaUrl) {
        URL.revokeObjectURL(etiquetaUrl);
      }

      setEtiquetaUrl(imageUrl);
    } catch (error) {
      console.error('Erro ao carregar etiqueta:', error);
      setErrorEtiqueta('Erro ao carregar etiqueta. Tente novamente.');
      setEtiquetaUrl('');
    } finally {
      setLoadingEtiqueta(false);
    }
  };

  const handleLoteSelect = (loteId: string) => {
    setSelectedLoteId(loteId);
    const lote = lotes.find((l) => l.id.toString() === loteId);
    if (lote && lote.codigoBarras) {
      loadEtiqueta(lote.id, tamanhoEtiqueta);
    } else {
      setEtiquetaUrl('');
      setErrorEtiqueta('');
    }
  };

  const handleTamanhoChange = (novoTamanho: string) => {
    setTamanhoEtiqueta(novoTamanho);
    if (selectedLoteId) {
      const lote = lotes.find((l) => l.id.toString() === selectedLoteId);
      if (lote) {
        loadEtiqueta(lote.id, novoTamanho);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (etiquetaUrl) {
        URL.revokeObjectURL(etiquetaUrl);
      }
    };
  }, [etiquetaUrl]);

  const selectedLote = lotes.find((l) => l.id.toString() === selectedLoteId);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Etiquetas</h1>
              <p className="text-muted-foreground">
                Visualize e imprima etiquetas com código de barras
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Selecionar Lote</CardTitle>
                  <CardDescription>Escolha um lote para visualizar sua etiqueta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="lote">Lote</Label>
                      {loading ? (
                        <div>Carregando...</div>
                      ) : (
                        <Select value={selectedLoteId} onValueChange={handleLoteSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um lote" />
                          </SelectTrigger>
                          <SelectContent>
                            {lotes.map((lote) => (
                              <SelectItem key={lote.id} value={lote.id.toString()}>
                                {lote.produtoNome} - {lote.codigoBarras || 'Sem código'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {selectedLote && (
                      <div className="space-y-4">
                        <div className="rounded-md border p-4">
                          <h3 className="mb-2 font-semibold">Informações do Lote</h3>
                          <div className="grid gap-1 text-sm">
                            <div>
                              <span className="font-medium">Produto:</span> {selectedLote.produtoNome}
                            </div>
                            <div>
                              <span className="font-medium">Código:</span>{' '}
                              {selectedLote.codigoBarras || '-'}
                            </div>
                            <div>
                              <span className="font-medium">Quantidade:</span>{' '}
                              {selectedLote.quantidadeAtual} unidades
                            </div>
                            {selectedLote.dataValidade && (
                              <div>
                                <span className="font-medium">Validade:</span>{' '}
                                {new Date(selectedLote.dataValidade).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {selectedLote.tamanho && (
                              <div>
                                <span className="font-medium">Tamanho:</span>{' '}
                                {selectedLote.tamanho}
                              </div>
                            )}
                            {selectedLote.voltagem && (
                              <div>
                                <span className="font-medium">Voltagem:</span>{' '}
                                {selectedLote.voltagem}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="tamanho">Tamanho da Etiqueta</Label>
                          <Select value={tamanhoEtiqueta} onValueChange={handleTamanhoChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tamanho" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PEQUENO">
                                Pequeno (6cm x 4cm)
                              </SelectItem>
                              <SelectItem value="MEDIO">
                                Médio (10cm x 5cm)
                              </SelectItem>
                              <SelectItem value="GRANDE">
                                Grande (12cm x 8cm)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visualização da Etiqueta</CardTitle>
                  <CardDescription>
                    A etiqueta será exibida aqui quando você selecionar um lote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingEtiqueta ? (
                    <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                      <p className="text-muted-foreground">Carregando etiqueta...</p>
                    </div>
                  ) : errorEtiqueta ? (
                    <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                      <p className="text-destructive">{errorEtiqueta}</p>
                    </div>
                  ) : etiquetaUrl ? (
                    <div className="space-y-4">
                      <div
                        ref={printRef}
                        className="flex items-center justify-center rounded-md border bg-white p-4"
                      >
                        <img
                          src={etiquetaUrl}
                          alt="Etiqueta do Lote"
                          className="max-w-full"
                        />
                      </div>
                      <Button variant="outline" onClick={handlePrint} className="w-full">
                        <IconPrinter className="mr-2 h-4 w-4" />
                        Imprimir Etiqueta
                      </Button>
                    </div>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                      <p className="text-muted-foreground">
                        Selecione um lote para visualizar sua etiqueta
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
