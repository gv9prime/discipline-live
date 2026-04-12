'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      try {
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error) {
          errorMessage = `Erro de Permissão: ${parsed.operationType} em ${parsed.path}`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-error/10 rounded-3xl flex items-center justify-center text-error">
                <AlertCircle size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-headline font-bold">Ops! Algo correu mal.</h2>
            <p className="text-on-surface-variant">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-background py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw size={20} />
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
