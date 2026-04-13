'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useFirebase } from '@/components/FirebaseProvider';
import { collection, onSnapshot, query, orderBy, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/error-handler';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Users, 
  ChevronRight, 
  Sparkles, 
  GraduationCap, 
  FileText, 
  PenTool, 
  MessageSquare,
  Save,
  Search,
  Globe,
  Languages,
  TrendingUp,
  ScrollText
} from 'lucide-react';
import Image from 'next/image';

interface SubjectData {
  notes: string;
  summaries: string;
  observations: string;
}

interface SubjectsState {
  [key: string]: SubjectData;
}

const SUBJECTS = [
  { id: 'filosofia', name: 'Filosofia', icon: <ScrollText size={24} />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'portugues', name: 'Português', icon: <PenTool size={24} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'ingles', name: 'Inglês', icon: <Languages size={24} />, color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'geografia', name: 'Geografia', icon: <Globe size={24} />, color: 'text-green-400', bg: 'bg-green-400/10' },
  { id: 'economia', name: 'Economia', icon: <TrendingUp size={24} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
];

type TabType = 'notes' | 'summaries' | 'observations';

export default function StudiesPage() {
  const { user } = useFirebase();
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0].id);
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [subjectsData, setSubjectsData] = useState<SubjectsState>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (user.uid === 'local-user') {
      const localData = localStorage.getItem('obsidian_pulse_studies');
      if (localData) {
        setTimeout(() => setSubjectsData(JSON.parse(localData)), 0);
      }
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'studies'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: SubjectsState = {};
      snapshot.docs.forEach(doc => {
        data[doc.id] = doc.data() as SubjectData;
      });
      setSubjectsData(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users/' + user.uid + '/studies');
    });

    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    if (user.uid === 'local-user') {
      localStorage.setItem('obsidian_pulse_studies', JSON.stringify(subjectsData));
      setTimeout(() => setIsSaving(false), 500);
      return;
    }

    try {
      const subjectRef = doc(db, 'users', user.uid, 'studies', activeSubject);
      await setDoc(subjectRef, {
        ...subjectsData[activeSubject],
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/' + user.uid + '/studies/' + activeSubject);
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocalData = (value: string) => {
    setSubjectsData(prev => ({
      ...prev,
      [activeSubject]: {
        ...(prev[activeSubject] || { notes: '', summaries: '', observations: '' }),
        [activeTab]: value
      }
    }));
  };

  const currentSubject = SUBJECTS.find(s => s.id === activeSubject);
  const currentContent = subjectsData[activeSubject]?.[activeTab] || '';

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-32 space-y-12">
        {/* Hero Section */}
        <section>
          <p className="text-on-surface-variant font-label text-xs sm:text-sm uppercase tracking-[0.3em] mb-2">
            Academia & Focus
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-headline font-extrabold tracking-tight leading-none">
            Master your <span className="text-primary">craft.</span>
          </h2>
        </section>

        {/* Subjects Grid */}
        <section className="space-y-6">
          <h3 className="text-2xl font-headline font-bold px-2">Disciplinas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {SUBJECTS.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setActiveSubject(subject.id)}
                className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-4 group ${
                  activeSubject === subject.id 
                    ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(0,227,253,0.1)]' 
                    : 'bg-surface-container-low border-white/5 hover:bg-surface-container'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${subject.bg} ${subject.color}`}>
                  {subject.icon}
                </div>
                <span className={`font-headline font-bold text-sm ${activeSubject === subject.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {subject.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Study Workspace */}
        <section className="bg-surface-container-low rounded-[2.5rem] border border-white/5 overflow-hidden min-h-[500px] flex flex-col">
          {/* Workspace Header */}
          <div className="p-6 sm:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentSubject?.bg} ${currentSubject?.color}`}>
                {currentSubject?.icon}
              </div>
              <div>
                <h4 className="text-2xl font-headline font-extrabold">{currentSubject?.name}</h4>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest">Workspace Ativo</p>
              </div>
            </div>

            <div className="flex bg-surface-container-highest p-1 rounded-2xl">
              {[
                { id: 'notes', label: 'Notas', icon: <FileText size={16} /> },
                { id: 'summaries', label: 'Resumos', icon: <Sparkles size={16} /> },
                { id: 'observations', label: 'Observações', icon: <MessageSquare size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-primary text-background shadow-lg' 
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-grow p-6 sm:p-8 relative">
            <textarea
              value={currentContent}
              onChange={(e) => updateLocalData(e.target.value)}
              placeholder={`Comece a escrever suas ${activeTab === 'notes' ? 'notas' : activeTab === 'summaries' ? 'resumos' : 'observações'} de ${currentSubject?.name}...`}
              className="w-full h-full min-h-[300px] bg-transparent border-none outline-none resize-none font-body text-lg leading-relaxed text-on-surface placeholder:text-zinc-700"
            />
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`absolute bottom-8 right-8 p-4 rounded-2xl flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-all ${
                isSaving ? 'bg-zinc-800 text-zinc-500' : 'bg-primary text-background shadow-xl hover:scale-105 active:scale-95'
              }`}
            >
              <Save size={18} />
              {isSaving ? 'Gravando...' : 'Gravar'}
            </button>
          </div>
        </section>

        {/* Quick Stats Mini Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container rounded-3xl p-6 border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Tempo Total</p>
              <p className="text-xl font-headline font-extrabold">12.5 Horas</p>
            </div>
          </div>
          <div className="bg-surface-container rounded-3xl p-6 border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Resumos Feitos</p>
              <p className="text-xl font-headline font-extrabold">24 Arquivos</p>
            </div>
          </div>
          <div className="bg-surface-container rounded-3xl p-6 border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Nível de Foco</p>
              <p className="text-xl font-headline font-extrabold">Elite</p>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
