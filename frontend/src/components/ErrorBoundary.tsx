import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary capturou um erro:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // Ex: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconAlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Algo deu errado</CardTitle>
              </div>
              <CardDescription>
                Ocorreu um erro inesperado na aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.MODE === "development" && this.state.error && (
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm font-mono text-destructive">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-muted-foreground">
                        Stack trace
                      </summary>
                      <pre className="mt-2 overflow-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  <IconRefresh className="mr-2 h-4 w-4" />
                  Recarregar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/dashboard")}
                  className="flex-1"
                >
                  Ir para Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

