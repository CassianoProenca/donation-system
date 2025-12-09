/**
 * Sistema de Gestão de Doações
 * Copyright (c) 2025 Cassiano Melo
 *
 * Este projeto é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença MIT conforme publicada pela Open Source Initiative.
 *
 * GitHub: https://github.com/Cassiano-DEV999/donation-system
 * Autor: Cassiano Melo <cassianomeloprofissional@gmail.com>
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/shared/api/queryClient";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const DashboardPageNew = lazy(() => import("@/pages/DashboardPageNew"));

const CategoriasPageNew = lazy(() => 
  import("@/pages/CategoriasPageNew").then(module => ({ default: module.CategoriasPageNew }))
);
const ProdutosPageNew = lazy(() => 
  import("@/pages/ProdutosPageNew").then(module => ({ default: module.ProdutosPageNew }))
);
const LotesPageNew = lazy(() => 
  import("@/pages/LotesPageNew").then(module => ({ default: module.LotesPageNew }))
);
const MovimentacoesPageNew = lazy(() => 
  import("@/pages/MovimentacoesPageNew").then(module => ({ default: module.MovimentacoesPageNew }))
);
const EtiquetasPage = lazy(() => 
  import("@/pages/EtiquetasPage").then(module => ({ default: module.EtiquetasPage }))
);
const DoacoesPage = lazy(() => 
  import("@/pages/DoacoesPage").then(module => ({ default: module.DoacoesPage }))
);
const UsuariosPageNew = lazy(() => 
  import("@/pages/UsuariosPageNew").then(module => ({ default: module.UsuariosPageNew }))
);
const PerfilPage = lazy(() => 
  import("@/pages/PerfilPage").then(module => ({ default: module.PerfilPage }))
);

// Componente de fallback para Suspense
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="ong-theme">
          <BrowserRouter>
            <AuthProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route 
                    path="/login" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <LoginPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/signup" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <SignupPage />
                      </Suspense>
                    } 
                  />

                  {/* Protected Routes with Layout */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route 
                      path="/dashboard" 
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <DashboardPageNew />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/categorias" 
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <CategoriasPageNew />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/produtos" 
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <ProdutosPageNew />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/lotes" 
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <LotesPageNew />
                        </Suspense>
                      } 
                    />
                    <Route
                      path="/movimentacoes"
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <MovimentacoesPageNew />
                        </Suspense>
                      }
                    />
                    <Route 
                      path="/etiquetas" 
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <EtiquetasPage />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/doacoes" 
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <DoacoesPage />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/perfil" 
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <PerfilPage />
                        </Suspense>
                      } 
                    />
                  </Route>

                  {/* Admin Only Routes with Layout */}
                  <Route
                    element={
                      <AdminRoute>
                        <MainLayout />
                      </AdminRoute>
                    }
                  >
                    <Route 
                      path="/usuarios" 
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <UsuariosPageNew />
                        </Suspense>
                      } 
                    />
                  </Route>

                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
