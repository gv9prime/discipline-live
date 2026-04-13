'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useFirebase } from '@/components/FirebaseProvider';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/error-handler';
import { motion } from 'framer-motion';
import { Plus, Book, BookOpen, Bed, History, Home, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import Image from 'next/image';

interface Goal {
  id: string;
  title: string;
  category: string;
  status: string;
  progress?: number;
  description?: string;
}

export default function GoalsPage() {
  const { user } = useFirebase();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    if (user.uid === 'local-user') {
      const localUserData = localStorage.getItem('obsidian_pulse_user_data');
      if (localUserData) setTimeout(() => setUserData(JSON.parse(localUserData)), 0);

      const localGoals = localStorage.getItem('obsidian_pulse_goals');
      if (localGoals) setTimeout(() => setGoals(JSON.parse(localGoals)), 0);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'goals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      setGoals(goalsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users/' + user.uid + '/goals');
    });

    const userUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });

    return () => {
      unsubscribe();
      userUnsubscribe();
    };
  }, [user]);

  const progress = userData ? Math.min(100, Math.round((userData.completedTasks / (userData.dailyGoal || 1)) * 100)) : 0;

  const addSampleGoal = async () => {
    if (!user) return;

    if (user.uid === 'local-user') {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: 'New Study Goal',
        category: 'Studying',
        status: 'in-progress',
        progress: 0
      };
      const updatedGoals = [newGoal, ...goals];
      setGoals(updatedGoals);
      localStorage.setItem('obsidian_pulse_goals', JSON.stringify(updatedGoals));
      return;
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'goals'), {
        title: 'New Study Goal',
        category: 'Studying',
        status: 'in-progress',
        progress: 0,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/' + user.uid + '/goals');
    }
  };

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
        {/* Hero Section */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
            <div>
              <p className="text-on-surface-variant font-label text-xs sm:text-sm uppercase tracking-widest mb-2">Performance Overview</p>
              <h2 className="text-3xl sm:text-4xl font-headline font-extrabold tracking-tight">Today&apos;s Focus</h2>
            </div>
            <button 
              onClick={addSampleGoal}
              className="w-full sm:w-auto bg-primary text-background px-6 py-3 rounded-full font-headline font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,227,253,0.3)] hover:scale-105 transition-transform active:scale-95"
            >
              <Plus size={20} />
              New Goal
            </button>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-surface-container-low p-8 rounded-3xl flex flex-col justify-between min-h-[240px]">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-primary text-5xl font-headline font-extrabold">{progress}%</span>
                  <span className="text-on-surface-variant text-sm font-label uppercase tracking-wider">Daily Completion Rate</span>
                </div>
                <div className="w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <motion.path
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${progress}, 100` }}
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex gap-4 overflow-hidden">
                <div className="h-1 bg-primary rounded-full flex-1" style={{ opacity: progress > 20 ? 1 : 0.2 }} />
                <div className="h-1 bg-primary rounded-full flex-1" style={{ opacity: progress > 40 ? 1 : 0.2 }} />
                <div className="h-1 bg-primary rounded-full flex-1" style={{ opacity: progress > 60 ? 1 : 0.2 }} />
                <div className="h-1 bg-primary rounded-full flex-1" style={{ opacity: progress > 80 ? 1 : 0.2 }} />
                <div className="h-1 bg-primary rounded-full flex-1" style={{ opacity: progress >= 100 ? 1 : 0.2 }} />
              </div>
            </div>
            <div className="bg-surface-container p-8 rounded-3xl flex flex-col justify-between border border-primary/5">
              <Sparkles className="text-tertiary text-4xl" />
              <div>
                <h3 className="text-on-surface font-headline font-bold text-xl mb-1">Study Streak</h3>
                <p className="text-on-surface-variant text-sm">{userData?.streak || 0} days and counting. Keep your pulse active!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-12">
          {/* Category: Objetivos */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-headline font-bold tracking-tight">Objetivos</h3>
              <span className="bg-surface-container-highest text-on-surface-variant text-xs font-bold px-3 py-1 rounded-full">{goals.length} TOTAL</span>
            </div>
            <div className="space-y-4">
              {goals.length === 0 ? (
                <p className="text-on-surface-variant italic opacity-50">No goals yet. Add one to start tracking!</p>
              ) : (
                goals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))
              )}
            </div>
          </section>

          {/* Category: Estudos */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-headline font-bold tracking-tight">Estudos</h3>
              <span className="bg-surface-container-highest text-on-surface-variant text-xs font-bold px-3 py-1 rounded-full">UPCOMING</span>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-surface-container mb-6 aspect-video group">
              <Image
                src="https://picsum.photos/seed/study/800/600"
                alt="Study"
                fill
                className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="bg-primary text-background text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-tighter">Deep Work Session</span>
                <h4 className="text-xl font-headline font-bold mt-2">Quantum Physics Intro</h4>
                <p className="text-on-surface-variant text-sm mt-1">Scheduled for 16:00 • 90 min</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-surface-container-low p-5 rounded-2xl border-l-4 border-primary">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-on-surface font-bold">Research Project</span>
                  <span className="text-primary text-xs font-bold">75% Complete</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Studying': return <Book size={24} />;
      case 'Reading': return <BookOpen size={24} />;
      case 'Habit': return <Bed size={24} />;
      case 'Work': return <History size={24} />;
      case 'Home': return <Home size={24} />;
      default: return <Trophy size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'text-primary bg-primary/10';
      case 'completed': return 'text-secondary bg-secondary/10';
      case 'urgent': return 'text-error bg-error/10';
      case 'done': return 'text-secondary bg-secondary/10';
      default: return 'text-on-surface-variant bg-surface-container-highest';
    }
  };

  return (
    <div className="group bg-surface-container hover:bg-surface-container-high transition-all p-5 rounded-2xl flex items-center justify-between cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(goal.status).split(' ')[0]} bg-opacity-10`}>
          {getIcon(goal.category)}
        </div>
        <div>
          <h4 className="font-bold text-on-surface">{goal.title}</h4>
          <p className="text-on-surface-variant text-xs">{goal.category} {goal.description ? `- ${goal.description}` : ''}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${getStatusColor(goal.status)}`}>
          {goal.status.replace('-', ' ')}
        </span>
        <ChevronRight className="text-on-surface-variant group-hover:translate-x-1 transition-transform" size={20} />
      </div>
    </div>
  );
}
