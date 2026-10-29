'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  UserProfile,
  DailySummary,
  FastingStatus,
  WaterStatus,
  WeightLog,
  WorkoutSession,
} from '@/lib/types';
import { BottomNav } from '@/components/layout/BottomNav';
import { MacroRings } from '@/components/dashboard/MacroRings';
import { FastingWidget } from '@/components/dashboard/FastingWidget';
import { WaterWidget } from '@/components/dashboard/WaterWidget';
import { DiaryView } from '@/components/diary/DiaryView';
import { WeightTrendChart } from '@/components/weight/WeightTrendChart';
import { WorkoutLogger } from '@/components/workout/WorkoutLogger';
import { SettingsView } from '@/components/settings/SettingsView';
import { FoodSearchModal } from '@/components/modals/FoodSearchModal';
import { Sparkles, Plus, Dumbbell, BookOpen, Flame } from 'lucide-react';

function getRealtimeMealType(): 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'BREAKFAST';
  if (hour >= 11 && hour < 14) return 'LUNCH';
  if (hour >= 14 && hour < 18) return 'SNACK';
  if (hour >= 18 && hour < 22) return 'DINNER';
  return 'SNACK';
}

export default function Home() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Global State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [fastingStatus, setFastingStatus] = useState<FastingStatus | null>(null);
  const [waterStatus, setWaterStatus] = useState<WaterStatus | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [backendStatus, setBackendStatus] = useState<'CONNECTING' | 'ONLINE' | 'OFFLINE'>('CONNECTING');

  // Modal State
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('LUNCH');

  const loadData = async () => {
    try {
      const [p, s, f, w, weights, workouts] = await Promise.allSettled([
        api.getProfile(),
        api.getDailySummary(currentDate),
        api.getFastingStatus(),
        api.getWaterStatus(currentDate),
        api.getWeightLogs(),
        api.getWorkouts(),
      ]);

      if (p.status === 'fulfilled') {
        setProfile(p.value);
        setBackendStatus('ONLINE');
      } else {
        setBackendStatus('OFFLINE');
      }
      if (s.status === 'fulfilled') setSummary(s.value);
      if (f.status === 'fulfilled') setFastingStatus(f.value);
      if (w.status === 'fulfilled') setWaterStatus(w.value);
      if (weights.status === 'fulfilled') setWeightLogs(weights.value);
      if (workouts.status === 'fulfilled') setWorkoutSessions(workouts.value);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setBackendStatus('OFFLINE');
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (backendStatus !== 'ONLINE') {
        loadData();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [currentDate, backendStatus]);

  const handleOpenAddFood = (mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK') => {
    setActiveMealType(mealType);
    setIsFoodModalOpen(true);
  };

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-5">
      {/* Top Mobile Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              Macro<span className="text-brand-blue">Track</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide flex items-center gap-1 ${
              backendStatus === 'ONLINE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              {backendStatus === 'ONLINE' ? 'Online' : 'Đang kết nối...'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Xin chào, <span className="text-gray-200 font-semibold">{profile?.name || 'Bạn'}</span> 👋
          </p>
        </div>

        <button
          onClick={() => handleOpenAddFood(getRealtimeMealType())}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-brand-blue text-white text-xs font-bold shadow-lg shadow-brand-blue/20 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm món</span>
        </button>
      </header>

      {/* Backend Offline / Connecting Alert */}
      {backendStatus === 'OFFLINE' && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs text-red-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Đang kết nối máy chủ Cloud Backend...</span>
          </div>
          <button
            onClick={() => loadData()}
            className="px-2.5 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white font-bold"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Dynamic Tab Body */}
      <div className="flex-1 pb-4">
        {/* TAB 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Macro Circles */}
            <MacroRings summary={summary} />

            {/* Fasting Widget (if enabled) */}
            {profile?.showFastingWidget !== false && (
              <FastingWidget status={fastingStatus} onRefresh={loadData} />
            )}

            {/* Water Widget (if enabled) */}
            {profile?.showWaterWidget !== false && (
              <WaterWidget status={waterStatus} onRefresh={loadData} />
            )}

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setCurrentTab('diary')}
                className="p-3.5 bg-card hover:bg-card-hover border border-border rounded-3xl flex items-center gap-3 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-2xl bg-brand-blue/15 flex items-center justify-center text-brand-blue shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Xem Nhật Ký</h4>
                  <p className="text-[10px] text-gray-400">4 bữa trong ngày</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentTab('workout')}
                className="p-3.5 bg-card hover:bg-card-hover border border-border rounded-3xl flex items-center gap-3 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-2xl bg-brand-emerald/15 flex items-center justify-center text-brand-emerald shrink-0">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Buổi Tập</h4>
                  <p className="text-[10px] text-gray-400">Ghi tạ & 1RM</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DIARY */}
        {currentTab === 'diary' && (
          <div className="animate-in fade-in duration-200">
            <DiaryView
              summary={summary}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onOpenAddModal={handleOpenAddFood}
              onRefresh={loadData}
            />
          </div>
        )}

        {/* TAB 3: WEIGHT & EXPENDITURE TREND */}
        {currentTab === 'weight' && (
          <div className="animate-in fade-in duration-200">
            <WeightTrendChart
              logs={weightLogs}
              profile={profile}
              onRefresh={loadData}
            />
          </div>
        )}

        {/* TAB 4: WORKOUT */}
        {currentTab === 'workout' && (
          <div className="animate-in fade-in duration-200">
            <WorkoutLogger
              sessions={workoutSessions}
              onRefresh={loadData}
            />
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {currentTab === 'settings' && (
          <div className="animate-in fade-in duration-200">
            <SettingsView
              profile={profile}
              onRefresh={loadData}
            />
          </div>
        )}
      </div>

      {/* Global Food Search & Log Modal */}
      <FoodSearchModal
        isOpen={isFoodModalOpen}
        mealType={activeMealType}
        logDate={currentDate}
        onClose={() => setIsFoodModalOpen(false)}
        onFoodAdded={loadData}
      />

      {/* Persistent Mobile Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
    </main>
  );
}
