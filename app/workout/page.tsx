'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useFirebase } from '@/components/FirebaseProvider';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/error-handler';
import { motion } from 'framer-motion';
import { Plus, Dumbbell, Play, Repeat, ChevronRight, Activity, Timer } from 'lucide-react';
import Image from 'next/image';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  image: string;
}

interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  intensity: string;
  exercises: Exercise[];
  date: any;
}

export default function WorkoutPage() {
  const { user } = useFirebase();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    if (user.uid === 'local-user') {
      const localUserData = localStorage.getItem('obsidian_pulse_user_data');
      if (localUserData) setTimeout(() => setUserData(JSON.parse(localUserData)), 0);

      const localWorkouts = localStorage.getItem('obsidian_pulse_workouts');
      if (localWorkouts) setTimeout(() => setWorkouts(JSON.parse(localWorkouts)), 0);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'workouts'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workoutsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));
      setWorkouts(workoutsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users/' + user.uid + '/workouts');
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
  const caloriesToGo = userData ? Math.max(0, 2500 - (userData.caloriesBurned || 0)) : 2500;

  const addSampleWorkout = async () => {
    if (!user) return;

    if (user.uid === 'local-user') {
      const newWorkout: Workout = {
        id: Date.now().toString(),
        title: 'Elite Hypertrophy V2.4',
        description: 'Focus: Lat Width & Pectoral Density',
        duration: 60,
        intensity: 'High',
        exercises: [
          { name: 'Puxada Aberta', sets: 4, reps: '12-15', image: 'https://picsum.photos/seed/back/300/300' },
          { name: 'Supino Inclinado', sets: 4, reps: '10-12', image: 'https://picsum.photos/seed/chest/300/300' },
          { name: 'Remada Baixa', sets: 3, reps: '12', image: 'https://picsum.photos/seed/row/300/300' }
        ],
        date: new Date().toISOString()
      };
      const updatedWorkouts = [newWorkout, ...workouts];
      setWorkouts(updatedWorkouts);
      localStorage.setItem('obsidian_pulse_workouts', JSON.stringify(updatedWorkouts));
      return;
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'workouts'), {
        title: 'Elite Hypertrophy V2.4',
        description: 'Focus: Lat Width & Pectoral Density',
        duration: 60,
        intensity: 'High',
        exercises: [
          { name: 'Puxada Aberta', sets: 4, reps: '12-15', image: 'https://picsum.photos/seed/back/300/300' },
          { name: 'Supino Inclinado', sets: 4, reps: '10-12', image: 'https://picsum.photos/seed/chest/300/300' },
          { name: 'Remada Baixa', sets: 3, reps: '12', image: 'https://picsum.photos/seed/row/300/300' }
        ],
        date: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/' + user.uid + '/workouts');
    }
  };

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-32 space-y-10">
        {/* Hero Progress Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-surface-container-low rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-primary font-headline tracking-widest text-xs uppercase font-bold">Current Phase</span>
              <h2 className="text-3xl sm:text-4xl font-headline font-extrabold mt-2 leading-tight">Elite Hypertrophy <br/><span className="text-on-surface-variant">V2.4</span></h2>
            </div>
            <div className="mt-8 flex items-end justify-between relative z-10">
              <div>
                <p className="text-on-surface-variant text-sm font-medium">Daily Completion</p>
                <p className="text-3xl font-headline font-bold text-primary">{progress}%</p>
              </div>
              <div className="flex -space-x-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-background ${i < (userData?.streak || 0) % 7 ? 'bg-primary text-background' : 'bg-zinc-800 text-zinc-500'}`}>
                    {day}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          </div>
          <div className="bg-surface-container rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-white/5">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-highest" cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" />
                <motion.circle
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 * (caloriesToGo / 2500) }}
                  className="text-primary"
                  cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8"
                  strokeDasharray="364.4"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-headline font-extrabold">{caloriesToGo}</span>
                <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant">kcal to go</span>
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant">Daily Energy Burn</p>
          </div>
        </section>

        {/* Training Plan Tabs */}
        <section className="overflow-x-auto no-scrollbar">
          <div className="flex gap-3 min-w-max">
            {['Monday', 'Wednesday', 'Friday', 'Saturday'].map((day, i) => (
              <button 
                key={day}
                className={`px-6 py-4 rounded-2xl flex flex-col items-start gap-1 transition-all ${i === 0 ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,229,255,0.1)]' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
              >
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">{day}</span>
                <span className="font-headline font-bold text-sm">{i === 0 ? 'Largura e Peito' : 'Braços - Pump Extremo'}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Exercises Detail */}
        <section className="space-y-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-headline font-extrabold uppercase tracking-tight">Monday Routine</h3>
              <p className="text-on-surface-variant text-sm">Focus: Lat Width & Pectoral Density</p>
            </div>
            <div className="text-right">
              <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Active Session</span>
            </div>
          </div>

          {workouts.length === 0 ? (
            <div className="text-center py-12 bg-surface-container rounded-3xl border border-dashed border-white/10">
              <p className="text-on-surface-variant mb-4">No workouts logged yet.</p>
              <button onClick={addSampleWorkout} className="text-primary font-bold flex items-center gap-2 mx-auto">
                <Plus size={20} /> Add Sample Workout
              </button>
            </div>
          ) : (
            workouts[0].exercises.map((exercise, i) => (
              <div key={i} className="bg-surface-container rounded-3xl p-1 flex items-center group transition-all hover:bg-surface-container-high">
                <div className="w-24 h-24 rounded-2xl overflow-hidden m-2 shrink-0 relative">
                  <Image
                    src={exercise.image}
                    alt={exercise.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow px-4">
                  <h4 className="font-headline font-bold text-lg">{exercise.name}</h4>
                  <div className="flex gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <Activity size={12} className="text-primary" />
                      <span className="text-xs text-on-surface-variant">{exercise.sets} sets</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Repeat size={12} className="text-primary" />
                      <span className="text-xs text-on-surface-variant">{exercise.reps} reps</span>
                    </div>
                  </div>
                </div>
                <div className="pr-6">
                  <button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:scale-110 active:scale-95 transition-all shadow-lg">
                    <Play size={20} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Bento Mini Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container rounded-3xl p-6 border border-white/5">
              <h4 className="font-headline font-bold text-sm mb-2 uppercase tracking-wide">Elevações Laterais</h4>
              <p className="text-primary font-headline text-2xl font-extrabold">4 x 15-20</p>
              <p className="text-on-surface-variant text-[10px] mt-1">Control negative phase</p>
            </div>
            <div className="bg-surface-container rounded-3xl p-6 border border-white/5">
              <h4 className="font-headline font-bold text-sm mb-2 uppercase tracking-wide">Abdominais</h4>
              <p className="text-error font-headline text-2xl font-extrabold">3 x FALHA</p>
              <p className="text-on-surface-variant text-[10px] mt-1">Max intensity sets</p>
            </div>
          </div>
        </section>

        {/* Exercise Library Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-headline font-extrabold uppercase tracking-tight">Biblioteca de Exercícios</h3>
              <p className="text-on-surface-variant text-sm">Catálogo completo com técnica e visualização</p>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-full flex items-center gap-2">
              <Dumbbell size={16} className="text-primary" />
              <span className="text-primary text-xs font-bold uppercase tracking-widest">Elite Catalog</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Supino Inclinado c/ Halteres', muscle: 'Peitoral Superior', img: 'https://picsum.photos/seed/chest-press/400/300', tech: 'Foco na contração de pico' },
              { name: 'Puxada Aberta no Pulley', muscle: 'Dorsais (Lats)', img: 'https://picsum.photos/seed/lat-pull/400/300', tech: 'Puxe com os cotovelos' },
              { name: 'Agachamento Búlgaro', muscle: 'Quadríceps & Glúteos', img: 'https://picsum.photos/seed/leg-day/400/300', tech: 'Mantenha o tronco ereto' },
              { name: 'Elevação Lateral', muscle: 'Deltoide Lateral', img: 'https://picsum.photos/seed/shoulders/400/300', tech: 'Braços levemente à frente' },
              { name: 'Rosca Direta c/ Barra W', muscle: 'Bíceps Braquial', img: 'https://picsum.photos/seed/biceps/400/300', tech: 'Sem balanço do tronco' },
              { name: 'Tríceps Corda', muscle: 'Tríceps (Cabeça Lateral)', img: 'https://picsum.photos/seed/triceps/400/300', tech: 'Abra a corda no final' },
            ].map((ex, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-surface-container-low rounded-[2rem] overflow-hidden border border-white/5 group"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={ex.img} 
                    alt={ex.name} 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-primary/20 backdrop-blur-md text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                      {ex.muscle}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h4 className="font-headline font-bold text-lg leading-tight">{ex.name}</h4>
                  <p className="text-on-surface-variant text-xs italic opacity-70">“{ex.tech}”</p>
                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <div key={star} className="w-1 h-1 rounded-full bg-primary/40" />
                      ))}
                    </div>
                    <button className="text-primary hover:translate-x-1 transition-transform">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAB */}
        <button className="fixed bottom-24 right-6 w-16 h-16 rounded-full glass-panel text-primary flex items-center justify-center shadow-2xl transition-all active:scale-95 border border-primary/20 z-40">
          <Play size={32} fill="currentColor" />
        </button>
      </main>
    </AppLayout>
  );
}
