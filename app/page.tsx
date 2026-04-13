'use client';

import React, { useEffect, useState } from 'react';
import { useFirebase } from '@/components/FirebaseProvider';
import { motion } from 'framer-motion';
import { ChevronRight, Edit3, Droplets, Timer, Sparkles, Plus, Minus, Save, CheckCircle2, Circle, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { AppLayout } from '@/components/AppLayout';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/error-handler';

export default function Dashboard() {
  const { user } = useFirebase();
  const [userData, setUserData] = useState<any>(null);
  const [reflection, setReflection] = useState('');
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    if (!user) return;

    if (user.uid === 'local-user') {
      const localData = localStorage.getItem('obsidian_pulse_user_data');
      if (localData) {
        setTimeout(() => setUserData(JSON.parse(localData)), 0);
      } else {
        const initialData = {
          streak: 0,
          dailyGoal: 5,
          completedTasks: 0,
          pendingTasks: 0,
          waterIntake: 0,
          sleepQuality: 0,
          caloriesBurned: 0,
          tasks: []
        };
        setTimeout(() => {
          setUserData(initialData);
          localStorage.setItem('obsidian_pulse_user_data', JSON.stringify(initialData));
        }, 0);
      }
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.data());
      }
    }, (error) => {
      console.warn('Firestore access error (likely permissions or non-existent doc):', error.message);
      // Fallback to local if permissions fail but user is logged in
      const localData = localStorage.getItem('obsidian_pulse_user_data');
      if (localData) setUserData(JSON.parse(localData));
    });

    return () => unsubscribe();
  }, [user]);

  const updateValue = async (field: string, newValue: any) => {
    if (!user) return;
    
    if (user.uid === 'local-user') {
      const updatedData = { ...userData, [field]: newValue };
      setUserData(updatedData);
      localStorage.setItem('obsidian_pulse_user_data', JSON.stringify(updatedData));
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [field]: newValue
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false
    };
    const updatedTasks = [...(userData?.tasks || []), newTask];
    updateValue('tasks', updatedTasks);
    setNewTaskText('');
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = userData.tasks.map((t: any) => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const completedCount = updatedTasks.filter((t: any) => t.completed).length;
    updateValue('tasks', updatedTasks);
    updateValue('completedTasks', completedCount);
    updateValue('pendingTasks', updatedTasks.length - completedCount);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = userData.tasks.filter((t: any) => t.id !== taskId);
    const completedCount = updatedTasks.filter((t: any) => t.completed).length;
    updateValue('tasks', updatedTasks);
    updateValue('completedTasks', completedCount);
    updateValue('pendingTasks', updatedTasks.length - completedCount);
  };

  const progress = userData?.tasks?.length > 0 
    ? Math.min(100, Math.round((userData.completedTasks / userData.tasks.length) * 100)) 
    : 0;

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-12 pb-32">
        {/* Hero Section */}
        <section>
          <p className="text-on-surface-variant font-label text-xs sm:text-sm uppercase tracking-[0.3em] mb-2">
            Bom dia, {user?.displayName?.split(' ')[0]}
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-headline font-extrabold tracking-tight leading-none">
            Your canvas is <span className="text-primary">fresh.</span>
          </h2>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Daily Progress */}
          <div className="md:col-span-5 lg:col-span-4 bg-surface-container-low rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
            <h3 className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-8 self-start">Daily Progress</h3>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-highest" cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="8" />
                <motion.circle
                  initial={{ strokeDashoffset: 552.9 }}
                  animate={{ strokeDashoffset: 552.9 * (1 - progress / 100) }}
                  className="text-primary"
                  cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12"
                  strokeDasharray="552.9"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-headline font-extrabold">{progress}%</span>
                <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest mt-1">Goal Reached</span>
              </div>
            </div>
            <div className="mt-10 w-full space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Nova tarefa..."
                  className="flex-grow bg-surface-container-highest/40 border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary/40"
                />
                <button onClick={addTask} className="bg-primary text-background p-2 rounded-xl hover:scale-105 transition-transform">
                  <Plus size={18} />
                </button>
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-2 no-scrollbar">
                {userData?.tasks?.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between bg-surface-container-highest/20 p-3 rounded-xl group">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-3 flex-grow text-left"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="text-primary shrink-0" size={18} />
                      ) : (
                        <Circle className="text-on-surface-variant shrink-0" size={18} />
                      )}
                      <span className={`text-sm ${task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                        {task.text}
                      </span>
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!userData?.tasks || userData.tasks.length === 0) && (
                  <p className="text-[10px] text-on-surface-variant text-center italic py-4">Nenhuma tarefa para hoje.</p>
                )}
              </div>
            </div>
          </div>

          {/* Today's Workout */}
          <div className="md:col-span-7 lg:col-span-8 bg-surface-container rounded-[2rem] relative overflow-hidden flex flex-col justify-end group min-h-[400px]">
            <Image
              src="https://picsum.photos/seed/gym/1200/800"
              alt="Workout"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="relative p-8 w-full">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-primary text-background px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Today&apos;s Protocol</span>
                <span className="text-on-surface-variant font-label text-sm">60 mins • High Intensity</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-headline font-extrabold mb-2 tracking-tight">Segunda: Largura e Peito</h3>
              <p className="text-on-surface-variant max-w-md mb-8">Focus on explosive concentric movements and slow eccentric control. Prioritize lat width and upper chest density.</p>
              <button className="bg-primary text-background px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:opacity-90 active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,227,253,0.3)]">
                Inaugurar Treino
              </button>
            </div>
          </div>

          {/* Daily Reflection */}
          <div className="md:col-span-12 lg:col-span-5 bg-surface-container-low rounded-[2rem] p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-tertiary/10 text-tertiary">
                <Edit3 size={24} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl">Daily Reflection</h3>
                <p className="text-on-surface-variant text-xs font-label uppercase tracking-wider">Mindset & Intention</p>
              </div>
            </div>
            <textarea
              className="w-full bg-surface-container-highest border-none rounded-2xl p-6 text-on-surface placeholder:text-zinc-600 focus:ring-1 focus:ring-primary/40 focus:bg-surface-container-high transition-all min-h-[160px] resize-none"
              placeholder="What's on your mind this morning?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-surface-container-highest text-zinc-500 hover:text-primary transition-colors">
                  <Sparkles size={18} />
                </button>
              </div>
              <button className="text-tertiary font-label text-xs uppercase tracking-widest font-bold hover:bg-tertiary/10 px-4 py-2 rounded-lg transition-all">
                Save Entry
              </button>
            </div>
          </div>

          {/* Targets */}
          <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container rounded-[2rem] p-6 hover:bg-surface-container-high transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <Droplets className="text-secondary" size={24} />
                <span className="text-[10px] text-zinc-500 font-label uppercase tracking-widest">Hydration</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-headline font-bold text-lg">{userData?.waterIntake || 0}L Water Intake</h4>
                <div className="flex gap-2">
                  <button onClick={() => updateValue('waterIntake', (userData?.waterIntake || 0) - 0.5)} className="p-1 rounded-lg bg-surface-container-highest hover:text-secondary transition-colors"><Minus size={14}/></button>
                  <button onClick={() => updateValue('waterIntake', (userData?.waterIntake || 0) + 0.5)} className="p-1 rounded-lg bg-surface-container-highest hover:text-secondary transition-colors"><Plus size={14}/></button>
                </div>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((userData?.waterIntake || 0) / 3) * 100)}%` }}
                  className="h-full bg-secondary"
                />
              </div>
            </div>
            <div className="bg-surface-container rounded-[2rem] p-6 hover:bg-surface-container-high transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <Timer className="text-error" size={24} />
                <span className="text-[10px] text-zinc-500 font-label uppercase tracking-widest">Sleep Quality</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-headline font-bold text-lg">{userData?.sleepQuality || 0}% Deep Sleep</h4>
                <div className="flex gap-2">
                  <button onClick={() => updateValue('sleepQuality', (userData?.sleepQuality || 0) - 5)} className="p-1 rounded-lg bg-surface-container-highest hover:text-error transition-colors"><Minus size={14}/></button>
                  <button onClick={() => updateValue('sleepQuality', (userData?.sleepQuality || 0) + 5)} className="p-1 rounded-lg bg-surface-container-highest hover:text-error transition-colors"><Plus size={14}/></button>
                </div>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${userData?.sleepQuality || 0}%` }}
                  className="h-full bg-error"
                />
              </div>
            </div>
            <div className="md:col-span-2 bg-gradient-to-r from-surface-container-low to-surface-container rounded-[2rem] p-6 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-headline font-bold">Weekly Streak: {userData?.streak || 0} Days</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => updateValue('streak', (userData?.streak || 0) - 1)} className="p-1 rounded bg-surface-container-highest hover:text-primary"><Minus size={10}/></button>
                      <button onClick={() => updateValue('streak', (userData?.streak || 0) + 1)} className="p-1 rounded bg-surface-container-highest hover:text-primary"><Plus size={10}/></button>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-xs">Keep pushing to reach the top 5%.</p>
                </div>
              </div>
              <ChevronRight className="text-zinc-600" />
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
