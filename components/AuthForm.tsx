'use client';

import React, { useState } from 'react';
import { useFirebase } from '@/components/FirebaseProvider';
import { Activity, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';

export function AuthForm() {
  const { loginAnonymously, loginWithEmail, registerWithEmail, resetPassword } = useFirebase();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await registerWithEmail(email, password, name);
      } else if (mode === 'login') {
        await loginWithEmail(email, password);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setMessage('Email de redefinição enviado! Verifique a sua caixa de entrada.');
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await loginAnonymously();
    } catch (err: any) {
      setError(err.message || 'O login como convidado falhou.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-[0_0_40px_rgba(0,227,253,0.1)]">
              <Activity size={48} />
            </div>
          </div>
          <h1 className="text-5xl font-headline font-extrabold tracking-tight">
            Obsidian <span className="text-primary">Pulse</span>
          </h1>
          <p className="text-on-surface-variant text-lg">
            {mode === 'register' ? 'Crie o seu perfil de elite' : 
             mode === 'forgot' ? 'Recupere o seu acesso' : 
             'Bem-vindo de volta ao sistema'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input
                type="text"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="email"
              placeholder="Endereço de Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input
                type="password"
                placeholder="Palavra-passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
          )}

          {error && <p className="text-error text-sm px-2">{error}</p>}
          {message && <p className="text-primary text-sm px-2">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-background py-4 rounded-2xl font-bold text-lg shadow-[0_0_30_rgba(0,227,253,0.3)] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'A processar...' : 
             mode === 'register' ? 'Criar Conta' : 
             mode === 'forgot' ? 'Enviar Link' : 
             'Entrar'}
            <ArrowRight size={20} />
          </button>
        </form>

        {mode === 'login' && (
          <div className="text-right">
            <button 
              onClick={() => toggleMode('forgot')}
              className="text-on-surface-variant text-sm hover:text-primary transition-colors"
            >
              Esqueceu a palavra-passe?
            </button>
          </div>
        )}

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="bg-background px-4 text-zinc-500">Ou continue como</span>
          </div>
        </div>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full bg-surface-container-highest text-on-surface py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-white/5 disabled:opacity-50"
        >
          <User size={20} />
          Entrar como Convidado
        </button>

        <p className="text-center text-on-surface-variant text-sm">
          {mode === 'register' ? 'Já tem uma conta?' : 
           mode === 'forgot' ? 'Lembrou-se da senha?' : 
           "Ainda não tem conta?"}{' '}
          <button
            onClick={() => toggleMode(mode === 'register' || mode === 'forgot' ? 'login' : 'register')}
            className="text-primary font-bold hover:underline"
          >
            {mode === 'register' || mode === 'forgot' ? 'Entrar' : 'Registar Agora'}
          </button>
        </p>
      </div>
    </div>
  );
}
