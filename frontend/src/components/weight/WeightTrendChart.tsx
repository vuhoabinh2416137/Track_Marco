'use client';

import React, { useState } from 'react';
import { WeightLog, UserProfile } from '@/lib/types';
import { api } from '@/lib/api';
import { Scale, Sparkles, TrendingDown, TrendingUp, Plus } from 'lucide-react';

interface WeightTrendChartProps {
  logs: WeightLog[];
  profile: UserProfile | null;
  onRefresh: () => void;
}

export const WeightTrendChart: React.FC<WeightTrendChartProps> = ({ logs, profile, onRefresh }) => {
  const [scaleInput, setScaleInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(scaleInput);
    if (!w || w <= 20 || w >= 300) return;

    setLoading(true);
    try {
      await api.logWeight({
        weight: w,
        notes: notesInput.trim() || undefined,
      });
      setScaleInput('');
      setNotesInput('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const currentTrend = latestLog ? latestLog.trendWeight : (profile?.currentWeightKg || 70.0);
  const currentScale = latestLog ? latestLog.scaleWeight : (profile?.currentWeightKg || 70.0);

  // Calculate SVG Points for recent logs
  const displayLogs = logs.slice(-14);
  const minWeight = displayLogs.length > 0 ? Math.min(...displayLogs.map(l => Math.min(l.scaleWeight, l.trendWeight))) - 0.5 : 68;
  const maxWeight = displayLogs.length > 0 ? Math.max(...displayLogs.map(l => Math.max(l.scaleWeight, l.trendWeight))) + 0.5 : 74;
  const range = Math.max(1, maxWeight - minWeight);

  const chartWidth = 320;
  const chartHeight = 140;

  const getX = (index: number) => {
    if (displayLogs.length <= 1) return chartWidth / 2;
    return (index / (displayLogs.length - 1)) * (chartWidth - 40) + 20;
  };

  const getY = (val: number) => {
    return chartHeight - ((val - minWeight) / range) * (chartHeight - 30) - 15;
  };

  const trendPoints = displayLogs.map((l, i) => `${getX(i)},${getY(l.trendWeight)}`).join(' ');

  return (
    <div className="space-y-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-3xl p-4 relative overflow-hidden">
          <span className="text-[11px] font-semibold text-gray-400 block mb-1">Cân Nặng Thực Tế</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-white font-mono">{currentScale.toFixed(1)}</span>
            <span className="text-xs text-gray-400 font-mono">kg</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">Bàn cân sáng nay</span>
        </div>

        <div className="bg-card border border-brand-blue/30 rounded-3xl p-4 relative overflow-hidden">
          <span className="text-[11px] font-semibold text-brand-blue block mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Cân Nặng Xu Hướng
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-brand-blue font-mono">{currentTrend.toFixed(2)}</span>
            <span className="text-xs text-brand-blue/70 font-mono">kg</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Đã khử nhiễu nước (EMA)</span>
        </div>
      </div>

      {/* SVG Trend Chart */}
      <div className="bg-card border border-border rounded-3xl p-4 shadow-xl">
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-brand-blue" />
            Biểu đồ Xu Hướng (MacroFactor Style)
          </h3>
          <div className="flex items-center gap-3 text-[10px] font-medium">
            <span className="flex items-center gap-1 text-gray-400">
              <span className="w-2 h-2 rounded-full bg-gray-500" /> Cân thô
            </span>
            <span className="flex items-center gap-1 text-brand-blue">
              <span className="w-2 h-2 rounded-full bg-brand-blue" /> Xu hướng
            </span>
          </div>
        </div>

        {displayLogs.length > 0 ? (
          <div className="w-full overflow-hidden flex justify-center py-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36">
              {/* Grid lines */}
              <line x1="10" y1="20" x2={chartWidth - 10} y2="20" stroke="#1E2235" strokeDasharray="4 4" />
              <line x1="10" y1="70" x2={chartWidth - 10} y2="70" stroke="#1E2235" strokeDasharray="4 4" />
              <line x1="10" y1="120" x2={chartWidth - 10} y2="120" stroke="#1E2235" strokeDasharray="4 4" />

              {/* Raw Scale Weight Dots */}
              {displayLogs.map((l, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(l.scaleWeight)}
                  r="3.5"
                  fill="#64748B"
                  className="transition-all"
                />
              ))}

              {/* Trend Weight Polyline */}
              {displayLogs.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={trendPoints}
                />
              )}
            </svg>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-gray-500">
            Chưa có dữ liệu cân. Hãy nhập cân nặng sáng nay bên dưới!
          </div>
        )}

        {/* TDEE Summary Banner */}
        <div className="mt-2 p-3 rounded-2xl bg-[#161926] border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block">TDEE Động Thích Ứng</span>
            <span className="text-base font-extrabold text-white font-mono">
              {profile?.estimatedTdee ? Math.round(profile.estimatedTdee) : 2300} <span className="text-xs text-gray-400 font-normal">kcal/ngày</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-gray-400 block">Mục tiêu {profile?.goalType === 'CUT' ? 'Giảm mỡ' : 'Tăng cơ'}</span>
            <span className="text-base font-extrabold text-brand-emerald font-mono">
              {profile?.targetCalories || 1900} <span className="text-xs text-gray-400 font-normal">kcal</span>
            </span>
          </div>
        </div>
      </div>

      {/* Log Weight Input Form */}
      <form onSubmit={handleLogWeight} className="bg-card border border-border rounded-3xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ghi nhận cân nặng mới</h4>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.05"
            required
            value={scaleInput}
            onChange={(e) => setScaleInput(e.target.value)}
            placeholder="Ví dụ: 71.8 (kg)"
            className="flex-1 bg-[#1A1D2A] border border-border rounded-2xl px-4 py-2.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-brand-blue"
          />
          <button
            type="submit"
            disabled={loading || !scaleInput}
            className="px-5 py-2.5 rounded-2xl bg-brand-blue text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Lưu
          </button>
        </div>
      </form>
    </div>
  );
};
