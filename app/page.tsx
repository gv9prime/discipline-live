'use client';

import React from 'react';
import { useFirebase } from '@/components/FirebaseProvider';
import { motion } from 'framer-motion';
import { ChevronRight, Edit3, Droplets, Timer, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { AppLayout } from '@/components/AppLayout';

export default function Dashboard() {
  const { user } = useFirebase();

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
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
                  animate={{ strokeDashoffset: 552.9 * 0.25 }}
                  className="text-primary"
                  cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12"
                  strokeDasharray="552.9"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-headline font-extrabold">75%</span>
                <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest mt-1">Goal Reached</span>
              </div>
            </div>
            <div className="mt-10 w-full grid grid-cols-2 gap-4">
              <div className="bg-surface-container-highest/40 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-primary font-headline font-bold text-xl">12</p>
                <p className="text-on-surface-variant font-label text-[10px] uppercase">Completed</p>
              </div>
              <div className="bg-surface-container-highest/40 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-on-surface font-headline font-bold text-xl">4</p>
                <p className="text-on-surface-variant font-label text-[10px] uppercase">Pending</p>
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
            <div className="bg-surface-container rounded-[2rem] p-6 hover:bg-surface-container-high transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <Droplets className="text-secondary" size={24} />
                <span className="text-[10px] text-zinc-500 font-label uppercase tracking-widest">Hydration</span>
              </div>
              <h4 className="font-headline font-bold text-lg mb-1">2.5L Water Intake</h4>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '66%' }}
                  className="h-full bg-secondary"
                />
              </div>
            </div>
            <div className="bg-surface-container rounded-[2rem] p-6 hover:bg-surface-container-high transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <Timer className="text-error" size={24} />
                <span className="text-[10px] text-zinc-500 font-label uppercase tracking-widest">Sleep Quality</span>
              </div>
              <h4 className="font-headline font-bold text-lg mb-1">Deep Sleep Target</h4>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '50%' }}
                  className="h-full bg-error"
                />
              </div>
            </div>
            <div className="md:col-span-2 bg-gradient-to-r from-surface-container-low to-surface-container rounded-[2rem] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="font-headline font-bold">Weekly Streak: 14 Days</p>
                  <p className="text-on-surface-variant text-xs">You&apos;re in the top 5% of active users.</p>
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
