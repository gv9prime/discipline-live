'use client';

import React from 'react';
import { useFirebase } from '@/components/FirebaseProvider';
import { Bell, Activity, Trophy, Dumbbell, BookOpen, Edit3, LogOut, Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import { AuthForm } from '@/components/AuthForm';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, authError } = useFirebase();
  const pathname = usePathname();
  const [showDownloadInfo, setShowDownloadInfo] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-surface-container-low p-8 rounded-[2rem] border border-error/20 text-center space-y-6">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center text-error mx-auto">
            <Activity size={32} />
          </div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Configuração Necessária</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {authError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-primary text-background rounded-full font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen pb-32 bg-background">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
              <Image
                src={user?.photoURL || 'https://picsum.photos/seed/user/100/100'}
                alt="Profile"
                width={40}
                height={40}
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-headline font-bold tracking-tighter text-primary uppercase truncate">Obsidian Pulse</span>
              {user?.uid === 'local-user' && (
                <span className="text-[8px] uppercase tracking-widest text-on-surface-variant">Modo Local</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.uid === 'local-user' ? (
              <Link 
                href="/auth"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all text-[10px] font-bold uppercase tracking-widest border border-white/5"
              >
                Entrar
              </Link>
            ) : (
              <button 
                onClick={() => logout()}
                className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            )}
            <button 
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold uppercase tracking-widest border border-primary/20"
              onClick={() => setShowDownloadInfo(!showDownloadInfo)} 
            >
              <Download size={16} />
              Download App
            </button>
            <button 
              className="sm:hidden p-2 rounded-full hover:bg-white/5 text-primary transition-colors shrink-0"
              onClick={() => setShowDownloadInfo(!showDownloadInfo)}
              title="Download App"
            >
              <Download size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 text-primary transition-colors shrink-0">
              <Bell size={24} />
            </button>
          </div>
        </div>
        
        {showDownloadInfo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-primary/10 border-t border-primary/20 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
              <p className="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-widest">
                Para instalar, use a opção &quot;Adicionar ao ecrã principal&quot; no menu do seu navegador.
              </p>
              <button onClick={() => setShowDownloadInfo(false)} className="text-primary hover:text-white transition-colors">
                <Activity size={16} className="rotate-45" />
              </button>
            </div>
          </motion.div>
        )}
      </header>

      <main className="w-full">{children}</main>

      {/* BottomNavBar */}
      <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center px-4 pb-6 sm:pb-8">
        <nav className="w-full max-w-xl flex justify-around items-center p-2 bg-surface-container/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl">
          <NavItem href="/" icon={<Activity size={20} />} label="Status" active={pathname === '/'} />
          <NavItem href="/goals" icon={<Trophy size={20} />} label="Metas" active={pathname === '/goals'} />
          <NavItem href="/workout" icon={<Dumbbell size={20} />} label="Treino" active={pathname === '/workout'} />
          <NavItem href="/studies" icon={<BookOpen size={20} />} label="Estudos" active={pathname === '/studies'} />
          <NavItem href="/journal" icon={<Edit3 size={20} />} label="Diário" active={pathname === '/journal'} />
        </nav>
      </div>
    </div>
    </ErrorBoundary>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center justify-center p-3 transition-all ${active ? 'text-primary bg-primary/10 rounded-2xl shadow-[0_0_20px_rgba(0,227,253,0.15)]' : 'text-zinc-500 hover:text-primary'}`}
    >
      {icon}
      <span className="font-body text-[10px] uppercase tracking-widest mt-1">{label}</span>
    </Link>
  );
}
