'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useFirebase } from '@/components/FirebaseProvider';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/error-handler';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Image as ImageIcon, Smile, Save, Utensils } from 'lucide-react';

interface NutritionLog {
  id: string;
  mealType: string;
  calories: number;
  items: string[];
  date: string;
}

export default function JournalPage() {
  const { user } = useFirebase();
  const [nutrition, setNutrition] = useState<NutritionLog[]>([]);
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    if (!user) return;

    if (user.uid === 'local-user') {
      const localNutrition = localStorage.getItem('obsidian_pulse_nutrition');
      if (localNutrition) setTimeout(() => setNutrition(JSON.parse(localNutrition)), 0);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'nutrition'), orderBy('date', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NutritionLog));
      setNutrition(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users/' + user.uid + '/nutrition');
    });

    return () => unsubscribe();
  }, [user]);

  const saveReflection = async () => {
    if (!user || !reflection) return;

    if (user.uid === 'local-user') {
      const localJournal = JSON.parse(localStorage.getItem('obsidian_pulse_journal') || '[]');
      localJournal.push({
        content: reflection,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('obsidian_pulse_journal', JSON.stringify(localJournal));
      setReflection('');
      return;
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'journal'), {
        content: reflection,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      setReflection('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/' + user.uid + '/journal');
    }
  };

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-32 space-y-12">
        {/* Meal Tracker Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Nutrição</span>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">Diário Alimentar</h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-primary text-xl sm:text-2xl font-headline font-extrabold">1,420</span>
              <span className="text-on-surface-variant font-label text-[10px] sm:text-xs block uppercase tracking-widest">Kcal Restantes</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Pequeno-almoço', 'Almoço', 'Jantar', 'Snacks'].map((meal) => (
              <MealCard key={meal} title={meal} nutrition={nutrition.find(n => n.mealType === meal)} />
            ))}
          </div>
        </section>

        {/* Journal Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-grow bg-white/10" />
            <h2 className="font-headline text-xl font-bold tracking-widest uppercase text-on-surface-variant">O Meu Dia</h2>
            <div className="h-[1px] flex-grow bg-white/10" />
          </div>

          <div className="relative">
            <div className="bg-surface-container-low rounded-[2.5rem] p-8 shadow-inner min-h-[400px] flex flex-col border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Sparkles className="text-tertiary" size={24} />
                  <span className="text-tertiary font-label text-sm font-medium">Reflexão Profunda</span>
                </div>
                <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
                  {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full flex-grow bg-transparent border-none focus:ring-0 text-on-surface font-body text-xl leading-relaxed placeholder:text-on-surface-variant placeholder:opacity-20 resize-none"
                placeholder="Como se sente hoje? Descreva os seus triunfos e os seus desafios..."
              />
              <div className="mt-8 flex justify-between items-center">
                <div className="flex gap-4">
                  <button className="text-on-surface-variant hover:text-primary transition-colors">
                    <ImageIcon size={24} />
                  </button>
                  <button className="text-on-surface-variant hover:text-primary transition-colors">
                    <Smile size={24} />
                  </button>
                </div>
                <button 
                  onClick={saveReflection}
                  className="bg-primary text-background px-8 py-3 rounded-full font-headline font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,227,253,0.3)] hover:scale-105 transition-transform"
                >
                  GUARDAR REGISTO
                </button>
              </div>
            </div>
            {/* Decorative Glow */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 blur-[100px] pointer-events-none">
              <div className="w-64 h-64 bg-primary rounded-full mx-auto" />
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}

function MealCard({ title, nutrition }: { title: string, nutrition?: NutritionLog }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-surface-container-low p-6 transition-all hover:bg-surface-container border border-white/5">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="font-headline text-lg font-bold">{title}</h3>
          <p className="text-on-surface-variant text-sm">
            {nutrition ? `${nutrition.calories} kcal` : 'Planeado • 500 kcal'}
          </p>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-active:scale-95 transition-all">
          <Plus size={20} />
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar min-h-[24px]">
        {nutrition?.items ? (
          nutrition.items.map((item, i) => (
            <div key={i} className="flex-shrink-0 px-3 py-1 bg-surface-container-highest rounded-full text-xs text-on-surface-variant">
              {item}
            </div>
          ))
        ) : (
          <span className="text-on-surface-variant text-xs italic opacity-40">Nenhum item adicionado</span>
        )}
      </div>
    </div>
  );
}
