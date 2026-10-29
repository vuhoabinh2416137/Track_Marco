'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Calendar, Coffee, Sun, Sunset, Cookie } from 'lucide-react';
import { DailySummary, MealLog } from '@/lib/types';
import { api } from '@/lib/api';

interface DiaryViewProps {
  summary: DailySummary | null;
  currentDate: string;
  onDateChange: (date: string) => void;
  onOpenAddModal: (mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK') => void;
  onRefresh: () => void;
}

export const DiaryView: React.FC<DiaryViewProps> = ({
  summary,
  currentDate,
  onDateChange,
  onOpenAddModal,
  onRefresh,
}) => {
  const mealSections = [
    { type: 'BREAKFAST', label: 'Bữa Sáng', icon: Coffee, color: 'text-amber-400' },
    { type: 'LUNCH', label: 'Bữa Trưa', icon: Sun, color: 'text-orange-400' },
    { type: 'DINNER', label: 'Bữa Tối', icon: Sunset, color: 'text-purple-400' },
    { type: 'SNACK', label: 'Bữa Phụ', icon: Cookie, color: 'text-emerald-400' },
  ] as const;

  const handleDeleteMeal = async (id: number) => {
    try {
      await api.deleteMeal(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Date Navigator Header */}
      <div className="bg-card border border-border rounded-2xl p-2.5 flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          title="Ngày trước"
          className="w-9 h-9 rounded-xl bg-[#1A1D2A] flex items-center justify-center text-gray-400 hover:text-white transition-colors active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Interactive Date Picker Button */}
        <div className="flex items-center gap-1.5">
          <label className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A1D2A] hover:bg-[#222638] border border-border/80 cursor-pointer transition-all active:scale-95 shadow-sm">
            <Calendar className="w-4 h-4 text-brand-blue shrink-0" />
            <span className="font-bold text-sm text-white font-mono select-none">
              {isToday ? `Hôm Nay (${currentDate})` : currentDate}
            </span>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) {
                  onDateChange(e.target.value);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>

          {!isToday && (
            <button
              onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
              className="px-2 py-1.5 rounded-xl bg-brand-blue/15 text-brand-blue text-[11px] font-bold hover:bg-brand-blue/25 transition-colors"
            >
              Hôm nay
            </button>
          )}
        </div>

        <button
          onClick={handleNextDay}
          title="Ngày sau"
          className="w-9 h-9 rounded-xl bg-[#1A1D2A] flex items-center justify-center text-gray-400 hover:text-white transition-colors active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 4 Meals Sections */}
      <div className="space-y-3.5">
        {mealSections.map((sec) => {
          const meals = summary?.mealsByType?.[sec.type] || [];
          const mealCalories = Math.round(meals.reduce((sum, m) => sum + m.calories, 0));
          const mealProtein = Math.round(meals.reduce((sum, m) => sum + m.proteinG, 0));
          const Icon = sec.icon;

          return (
            <div
              key={sec.type}
              className="bg-card border border-border rounded-3xl p-4 shadow-lg space-y-3"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-2xl bg-[#1A1D2A] flex items-center justify-center ${sec.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{sec.label}</h3>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {mealProtein}g protein
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white font-mono">
                    {mealCalories} <span className="text-[10px] text-gray-400 font-normal">kcal</span>
                  </span>
                  <button
                    onClick={() => onOpenAddModal(sec.type)}
                    className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center hover:bg-brand-blue/90 shadow-sm ml-1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items in Meal */}
              {meals.length > 0 ? (
                <div className="space-y-1.5 pt-1 border-t border-border/50">
                  {meals.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl bg-[#161926] flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <span className="text-gray-200 font-medium block">{item.foodName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {item.proteinG}g P • {item.carbsG}g C • {item.fatG}g F
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold text-xs">
                          {Math.round(item.calories)} <span className="text-[9px] text-gray-400 font-normal">kcal</span>
                        </span>
                        <button
                          onClick={() => handleDeleteMeal(item.id!)}
                          className="text-gray-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => onOpenAddModal(sec.type)}
                  className="w-full py-2.5 rounded-2xl bg-[#161926] hover:bg-[#1D2132] border border-dashed border-border/80 text-gray-400 hover:text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm món vào {sec.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
