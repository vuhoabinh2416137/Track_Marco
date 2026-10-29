'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Calendar, Coffee, Sun, Sunset, Cookie, X } from 'lucide-react';
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const parts = currentDate.split('-');
    return parseInt(parts[0], 10) || new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const parts = currentDate.split('-');
    return (parseInt(parts[1], 10) || (new Date().getMonth() + 1)) - 1;
  });

  // Đồng bộ viewYear / viewMonth khi currentDate thay đổi
  useEffect(() => {
    const parts = currentDate.split('-');
    if (parts.length === 3) {
      setViewYear(parseInt(parts[0], 10));
      setViewMonth(parseInt(parts[1], 10) - 1);
    }
  }, [currentDate]);

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
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    const yStr = dateObj.getFullYear();
    const mStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dStr = String(dateObj.getDate()).padStart(2, '0');
    onDateChange(`${yStr}-${mStr}-${dStr}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + 1);
    const yStr = dateObj.getFullYear();
    const mStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dStr = String(dateObj.getDate()).padStart(2, '0');
    onDateChange(`${yStr}-${mStr}-${dStr}`);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const now = new Date();
  const todayYmd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = currentDate === todayYmd;

  // Tính lịch ngày trong tháng (Thứ 2 = 0 ... Chủ Nhật = 6)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

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
          <button
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            title="Bấm để mở danh sách lịch chọn ngày"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A1D2A] hover:bg-[#222638] border border-border/80 cursor-pointer transition-all active:scale-95 shadow-sm group"
          >
            <Calendar className="w-4 h-4 text-brand-blue shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm text-white font-mono select-none">
              {isToday ? `Hôm Nay (${currentDate})` : currentDate}
            </span>
          </button>

          {!isToday && (
            <button
              onClick={() => onDateChange(todayYmd)}
              className="px-2.5 py-1.5 rounded-xl bg-brand-blue/15 text-brand-blue text-[11px] font-bold hover:bg-brand-blue/25 transition-colors"
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

      {/* Calendar Picker Modal / Dialog */}
      {isCalendarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="w-full max-w-xs bg-[#121522] border border-border/90 rounded-3xl p-4 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Tháng trước"
                className="w-8 h-8 rounded-xl bg-[#1A1D2A] hover:bg-[#252B42] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-sm text-white tracking-wide">
                Tháng {viewMonth + 1}, {viewYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                title="Tháng sau"
                className="w-8 h-8 rounded-xl bg-[#1A1D2A] hover:bg-[#252B42] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-400">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span className="text-red-400">CN</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`blank-${i}`} className="w-8 h-8" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dStr === currentDate;
                const isDayToday = dStr === todayYmd;

                return (
                  <button
                    key={dStr}
                    type="button"
                    onClick={() => {
                      onDateChange(dStr);
                      setIsCalendarOpen(false);
                    }}
                    className={`w-8 h-8 rounded-xl text-xs font-mono flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-brand-blue text-white font-bold shadow-md shadow-brand-blue/30 scale-105'
                        : isDayToday
                        ? 'border border-brand-blue text-brand-blue font-bold hover:bg-brand-blue/20'
                        : 'text-gray-300 hover:bg-[#1A1D2A] hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="flex gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  onDateChange(todayYmd);
                  setIsCalendarOpen(false);
                }}
                className="flex-1 py-1.5 rounded-xl bg-brand-blue/15 text-brand-blue text-xs font-bold hover:bg-brand-blue/25 transition-colors"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#1A1D2A] hover:bg-[#252B42] text-gray-400 hover:text-white text-xs font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
