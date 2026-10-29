'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Coffee,
  Sun,
  Sunset,
  Cookie,
  X,
  Minus,
  Check,
  Pencil,
} from 'lucide-react';
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

  // State for Editing Logged Meal Servings
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  const [editServings, setEditServings] = useState<number>(1.0);
  const [editServingsInput, setEditServingsInput] = useState<string>('1');

  // Đồng bộ viewYear / viewMonth khi currentDate thay đổi
  useEffect(() => {
    const parts = currentDate.split('-');
    if (parts.length === 3) {
      setViewYear(parseInt(parts[0], 10));
      setViewMonth(parseInt(parts[1], 10) - 1);
    }
  }, [currentDate]);

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

  const handleDeleteMeal = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa món này?')) {
      await api.deleteMeal(id);
      onRefresh();
    }
  };

  const openEditMeal = (meal: MealLog) => {
    setEditingMeal(meal);
    const s = meal.servings > 0 ? meal.servings : 1.0;
    setEditServings(s);
    setEditServingsInput(String(s));
  };

  const handleEditServingsChange = (val: string) => {
    setEditServingsInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setEditServings(num);
    }
  };

  const stepEditServing = (delta: number) => {
    const next = Math.max(0.1, Math.round((editServings + delta) * 10) / 10);
    setEditServings(next);
    setEditServingsInput(String(next));
  };

  const handleSaveMealUpdate = async () => {
    if (!editingMeal || !editingMeal.id) return;
    const baseServings = editingMeal.servings > 0 ? editingMeal.servings : 1.0;
    const ratio = editServings / baseServings;
    try {
      await api.updateMeal(editingMeal.id, {
        servings: editServings,
        calories: Math.round(editingMeal.calories * ratio * 10) / 10,
        proteinG: Math.round(editingMeal.proteinG * ratio * 10) / 10,
        carbsG: Math.round(editingMeal.carbsG * ratio * 10) / 10,
        fatG: Math.round(editingMeal.fatG * ratio * 10) / 10,
      });
      setEditingMeal(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const mealSections = [
    { type: 'BREAKFAST', label: 'Bữa Sáng', icon: Coffee, color: 'text-amber-400' },
    { type: 'LUNCH', label: 'Bữa Trưa', icon: Sun, color: 'text-orange-400' },
    { type: 'DINNER', label: 'Bữa Tối', icon: Sunset, color: 'text-indigo-400' },
    { type: 'SNACK', label: 'Bữa Phụ', icon: Cookie, color: 'text-teal-400' },
  ] as const;

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

  // Calculated macros for editing meal
  const editRatio = editingMeal ? editServings / (editingMeal.servings > 0 ? editingMeal.servings : 1.0) : 1.0;
  const editCalories = editingMeal ? Math.round(editingMeal.calories * editRatio) : 0;
  const editProtein = editingMeal ? Math.round(editingMeal.proteinG * editRatio * 10) / 10 : 0;
  const editCarbs = editingMeal ? Math.round(editingMeal.carbsG * editRatio * 10) / 10 : 0;
  const editFat = editingMeal ? Math.round(editingMeal.fatG * editRatio * 10) / 10 : 0;

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

      {/* Edit Logged Meal Servings Modal */}
      {editingMeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setEditingMeal(null)}
        >
          <div
            className="bg-[#121522] border border-border/90 rounded-3xl w-full max-w-sm p-4 sm:p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Chỉnh sửa số lượng
                </h3>
                <p className="text-xs text-brand-blue font-semibold mt-0.5">
                  {editingMeal.foodName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMeal(null)}
                className="w-8 h-8 rounded-full bg-[#1A1D2A] hover:bg-[#252B40] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper & Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 bg-[#181B28] p-2.5 rounded-2xl border border-border/60">
                <button
                  type="button"
                  onClick={() => stepEditServing(-0.5)}
                  className="w-10 h-10 rounded-xl bg-[#22273A] hover:bg-[#2C334D] text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={editServingsInput}
                      onChange={(e) => handleEditServingsChange(e.target.value)}
                      className="w-20 text-center font-mono font-black text-2xl text-white bg-transparent border-b border-brand-blue/60 focus:border-brand-blue focus:outline-none pb-0.5"
                    />
                    <span className="text-xs text-gray-400 font-semibold">phần</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => stepEditServing(0.5)}
                  className="w-10 h-10 rounded-xl bg-[#22273A] hover:bg-[#2C334D] text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Preset Chips */}
              <div className="flex items-center justify-between gap-1.5">
                {[0.5, 1.0, 1.5, 2.0, 3.0].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setEditServings(val);
                      setEditServingsInput(String(val));
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      editServings === val
                        ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30 scale-105'
                        : 'bg-[#181B28] hover:bg-[#22273A] text-gray-300'
                    }`}
                  >
                    {val}x
                  </button>
                ))}
              </div>
            </div>

            {/* Live Macro Breakdown */}
            <div className="bg-[#181B28] border border-border/80 rounded-2xl p-3 space-y-2">
              <div className="flex items-baseline justify-between border-b border-border/50 pb-2">
                <span className="text-xs text-gray-400 font-semibold">Calo sau điều chỉnh:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white font-mono">{editCalories}</span>
                  <span className="text-xs text-gray-400 font-semibold">kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-0.5">
                <div className="bg-[#121522] p-2 rounded-xl border border-brand-blue/20">
                  <span className="text-[10px] text-gray-400 block mb-0.5">Đạm (P)</span>
                  <span className="font-mono font-bold text-macro-protein">{editProtein}g</span>
                </div>
                <div className="bg-[#121522] p-2 rounded-xl border border-brand-cyan/20">
                  <span className="text-[10px] text-gray-400 block mb-0.5">Carb (C)</span>
                  <span className="font-mono font-bold text-macro-carbs">{editCarbs}g</span>
                </div>
                <div className="bg-[#121522] p-2 rounded-xl border border-brand-amber/20">
                  <span className="text-[10px] text-gray-400 block mb-0.5">Béo (F)</span>
                  <span className="font-mono font-bold text-macro-fat">{editFat}g</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const id = editingMeal.id;
                  setEditingMeal(null);
                  if (id) handleDeleteMeal(id);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa món
              </button>
              <button
                type="button"
                onClick={handleSaveMealUpdate}
                className="flex-1 py-2.5 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" /> Lưu thay đổi ({editCalories} kcal)
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
                      onClick={() => openEditMeal(item)}
                      className="p-2.5 rounded-2xl bg-[#161926] hover:bg-[#1C2032] border border-border/50 flex items-center justify-between text-xs cursor-pointer group transition-all"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-200 font-semibold group-hover:text-brand-blue transition-colors">
                            {item.foodName}
                          </span>
                          <Pencil className="w-3 h-3 text-gray-500 group-hover:text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                          <span className="text-brand-blue font-bold">
                            {item.servings > 0 ? `${item.servings} phần` : '1 phần'}
                          </span>
                          {' • '}
                          {item.proteinG}g P • {item.carbsG}g C • {item.fatG}g F
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold text-xs">
                          {Math.round(item.calories)} <span className="text-[9px] text-gray-400 font-normal">kcal</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.id) handleDeleteMeal(item.id);
                          }}
                          className="w-6 h-6 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                          title="Xóa món"
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
