'use client';

import React from 'react';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';
import { DailySummary } from '@/lib/types';

interface MacroRingsProps {
  summary: DailySummary | null;
}

export const MacroRings: React.FC<MacroRingsProps> = ({ summary }) => {
  if (!summary) return null;

  const targetCals = summary.targetCalories || 2000;
  const consumedCals = summary.totalCalories || 0;
  const remainingCals = targetCals - consumedCals;
  const calPercent = Math.min(100, Math.round((consumedCals / targetCals) * 100));

  const proteinTarget = summary.targetProteinG || 140;
  const proteinConsumed = summary.totalProteinG || 0;
  const proteinPercent = Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100));

  const carbsTarget = summary.targetCarbsG || 200;
  const carbsConsumed = summary.totalCarbsG || 0;
  const carbsPercent = Math.min(100, Math.round((carbsConsumed / carbsTarget) * 100));

  const fatTarget = summary.targetFatG || 60;
  const fatConsumed = summary.totalFatG || 0;
  const fatPercent = Math.min(100, Math.round((fatConsumed / fatTarget) * 100));

  // SVG Ring calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-macro-calories/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-brand-blue/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        {/* Main Calorie Circular Dial */}
        <div className="relative flex items-center justify-center w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#1E2235"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#calorieGradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {Math.abs(Math.round(remainingCals))}
            </span>
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">
              {remainingCals >= 0 ? 'Còn lại (kcal)' : 'Vượt mục tiêu'}
            </span>
            <span className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
              <Flame className="w-3 h-3 text-macro-calories" />
              {Math.round(consumedCals)} / {targetCals}
            </span>
          </div>
        </div>

        {/* 3 Macro Bars (Protein, Carbs, Fat) */}
        <div className="flex-1 ml-6 space-y-3.5">
          {/* Protein */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-gray-300 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-macro-protein" />
                Đạm (Protein)
              </span>
              <span className="text-gray-400 font-mono text-[11px]">
                {Math.round(proteinConsumed)} / {proteinTarget}g
              </span>
            </div>
            <div className="w-full bg-[#1A1D2A] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-macro-protein h-full rounded-full transition-all duration-500"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-gray-300 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-macro-carbs" />
                Tinh bột (Carbs)
              </span>
              <span className="text-gray-400 font-mono text-[11px]">
                {Math.round(carbsConsumed)} / {carbsTarget}g
              </span>
            </div>
            <div className="w-full bg-[#1A1D2A] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-macro-carbs h-full rounded-full transition-all duration-500"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-gray-300 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-macro-fat" />
                Chất béo (Fat)
              </span>
              <span className="text-gray-400 font-mono text-[11px]">
                {Math.round(fatConsumed)} / {fatTarget}g
              </span>
            </div>
            <div className="w-full bg-[#1A1D2A] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-macro-fat h-full rounded-full transition-all duration-500"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
