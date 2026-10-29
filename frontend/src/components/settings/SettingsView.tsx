'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { api } from '@/lib/api';
import { User, Target, Sliders, Check, Shield, Droplets, Timer, PieChart, Sparkles } from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile | null;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onRefresh }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('MALE');
  const [heightCm, setHeightCm] = useState('173');
  const [currentWeightInput, setCurrentWeightInput] = useState('53');
  const [targetWeight, setTargetWeight] = useState('53');
  const [goalType, setGoalType] = useState<'CUT' | 'MAINTAIN' | 'BULK'>('MAINTAIN');
  const [weeklyGoalRate, setWeeklyGoalRate] = useState('0.005');
  const [waterTarget, setWaterTarget] = useState('2000');
  const [fastingProtocol, setFastingProtocol] = useState('16_8');
  const [showFasting, setShowFasting] = useState(true);
  const [showWater, setShowWater] = useState(true);

  // Macro Customization State
  const [customMacro, setCustomMacro] = useState(false);
  const [proteinMode, setProteinMode] = useState<'RATIO' | 'GRAMS'>('RATIO');
  const [proteinRatio, setProteinRatio] = useState('2.0'); // g/kg
  const [proteinG, setProteinG] = useState('106');
  const [carbsG, setCarbsG] = useState('242');
  const [fatG, setFatG] = useState('51');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentWeight = parseFloat(currentWeightInput) || profile?.currentWeightKg || 53;

  useEffect(() => {
    if (profile) {
      setName(profile.name || 'Người Dùng');
      setGender(profile.gender || 'MALE');
      setHeightCm(String(profile.heightCm || 173));
      setCurrentWeightInput(String(profile.currentWeightKg || 53));
      setTargetWeight(String(profile.targetWeightKg || 53));
      setGoalType(profile.goalType || 'MAINTAIN');
      setWeeklyGoalRate(String(profile.weeklyGoalRate || 0.005));
      setWaterTarget(String(profile.waterTargetMl || 2000));
      setFastingProtocol(profile.fastingProtocol || '16_8');
      setShowFasting(profile.showFastingWidget ?? true);
      setShowWater(profile.showWaterWidget ?? true);
      setCustomMacro(profile.customMacro ?? false);

      const w = profile.currentWeightKg || 53;
      const initialRatio = profile.proteinRatioPerKg
        ? Math.round(profile.proteinRatioPerKg * 10) / 10
        : (profile.targetProteinG ? Math.round((profile.targetProteinG / w) * 10) / 10 : 2.0);
      setProteinRatio(String(initialRatio));
      setProteinG(String(profile.targetProteinG || Math.round(initialRatio * w)));
      setCarbsG(String(profile.targetCarbsG || 242));
      setFatG(String(profile.targetFatG || 51));
    }
  }, [profile]);

  // Tính toán calo từ macro chỉnh tay
  const pVal = parseFloat(proteinG) || 0;
  const cVal = parseFloat(carbsG) || 0;
  const fVal = parseFloat(fatG) || 0;
  const calculatedCustomCals = Math.round(pVal * 4 + cVal * 4 + fVal * 9);

  const applyProteinRatio = (ratio: number) => {
    setProteinMode('RATIO');
    setProteinRatio(String(ratio));
    const grams = Math.round(ratio * currentWeight);
    setProteinG(String(grams));
  };

  const applyPreset = (pRatio: number, cRatio: number, fRatio: number) => {
    const totalCals = profile?.targetCalories || 2000;
    const p = Math.round((totalCals * pRatio) / 4);
    const c = Math.round((totalCals * cRatio) / 4);
    const f = Math.round((totalCals * fRatio) / 9);
    setProteinG(String(p));
    setProteinRatio(String(Math.round((p / currentWeight) * 10) / 10));
    setCarbsG(String(c));
    setFatG(String(f));
    setCustomMacro(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const finalProteinRatio = proteinMode === 'RATIO'
        ? (parseFloat(proteinRatio) || 2.0)
        : (parseFloat(proteinG) / currentWeight);

      await api.updateProfile({
        name,
        gender,
        heightCm: parseFloat(heightCm) || 173,
        currentWeightKg: parseFloat(currentWeightInput) || 53,
        targetWeightKg: parseFloat(targetWeight) || 53,
        goalType,
        weeklyGoalRate: parseFloat(weeklyGoalRate) || 0.005,
        waterTargetMl: parseInt(waterTarget) || 2000,
        fastingProtocol,
        showFastingWidget: showFasting,
        showWaterWidget: showWater,
        customMacro,
        proteinRatioPerKg: customMacro ? Math.round(finalProteinRatio * 100) / 100 : undefined,
        targetProteinG: customMacro ? Math.round(pVal) : undefined,
        targetCarbsG: customMacro ? Math.round(cVal) : undefined,
        targetFatG: customMacro ? Math.round(fVal) : undefined,
        targetCalories: customMacro ? calculatedCustomCals : undefined,
      });
      setSavedSuccess(true);
      onRefresh();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dedicated App Header */}
      <div className="p-4 bg-card border border-border rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue/15 text-brand-blue flex items-center justify-center font-bold text-base">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{name}</h3>
            <p className="text-[11px] text-brand-emerald flex items-center gap-1">
              <Shield className="w-3 h-3" /> Chế độ Cá nhân (Single-User App)
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400 block">Hiện tại</span>
          <span className="font-mono font-bold text-white text-sm">
            {profile?.currentWeightKg.toFixed(1)} kg
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mục 1: Mục tiêu Thể hình */}
        <div className="bg-card border border-border rounded-3xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-brand-blue" />
            Mục tiêu Thể hình & Định lượng
          </h4>

          {/* Goal Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CUT', label: 'Giảm mỡ (Cut)' },
              { id: 'MAINTAIN', label: 'Giữ cân' },
              { id: 'BULK', label: 'Tăng cơ (Bulk)' },
            ].map((g) => (
              <button
                type="button"
                key={g.id}
                onClick={() => setGoalType(g.id as any)}
                className={`py-2 px-1 rounded-2xl text-xs font-semibold text-center transition-all ${
                  goalType === g.id
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'bg-[#1A1D2A] text-gray-400 hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Cân nặng hiện tại (kg)</label>
              <input
                type="number"
                step="0.1"
                value={currentWeightInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setCurrentWeightInput(val);
                  const wNum = parseFloat(val) || 0;
                  if (wNum > 0 && proteinMode === 'RATIO') {
                    const r = parseFloat(proteinRatio) || 2.0;
                    setProteinG(String(Math.round(r * wNum)));
                  }
                }}
                className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white font-mono focus:border-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Chiều cao (cm)</label>
              <input
                type="number"
                step="0.5"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white font-mono focus:border-brand-blue outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Mục tiêu cân nặng (kg)</label>
              <input
                type="number"
                step="0.5"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white font-mono focus:border-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Tốc độ (% cân/tuần)</label>
              <select
                value={weeklyGoalRate}
                onChange={(e) => setWeeklyGoalRate(e.target.value)}
                className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white font-mono focus:border-brand-blue outline-none"
              >
                <option value="0.0025">0.25% (Rất chậm, giữ cơ)</option>
                <option value="0.005">0.50% (Tiêu chuẩn vàng)</option>
                <option value="0.0075">0.75% (Tương đối nhanh)</option>
                <option value="0.01">1.00% (Tối đa an toàn)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mục 2: Tùy Chỉnh Macro (Đạm, Tinh Bột, Chất Béo) */}
        <div className="bg-card border border-border rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-brand-emerald" />
              Tùy Chỉnh Lượng Đạm, Carb, Béo
            </h4>

            {/* Switch Mode: Auto vs Custom */}
            <div className="flex items-center bg-[#1A1D2A] p-0.5 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setCustomMacro(false)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  !customMacro ? 'bg-brand-blue text-white' : 'text-gray-400'
                }`}
              >
                Tự động
              </button>
              <button
                type="button"
                onClick={() => setCustomMacro(true)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  customMacro ? 'bg-brand-emerald text-black font-bold' : 'text-gray-400'
                }`}
              >
                Tự chỉnh tay
              </button>
            </div>
          </div>

          {customMacro ? (
            <div className="space-y-3 pt-1 animate-in fade-in">
              <div className="p-3 bg-brand-emerald/10 border border-brand-emerald/30 rounded-2xl text-xs text-brand-emerald">
                ✨ Bạn đang ở chế độ <span className="font-bold">Tự điều chỉnh Macro</span>. Đạm có thể điều chỉnh linh hoạt theo <span className="font-bold">tỉ lệ cân nặng (g/kg)</span>:
              </div>

              {/* Quick Protein Ratio Chips */}
              <div>
                <span className="text-[11px] text-gray-400 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-macro-protein">
                    <span className="w-1.5 h-1.5 rounded-full bg-macro-protein" />
                    Chọn nhanh tỉ lệ Đạm theo cân nặng ({currentWeight.toFixed(1)} kg):
                  </span>
                </span>
                <div className="grid grid-cols-5 gap-1 text-[11px] font-mono">
                  {[
                    { ratio: 1.6, label: '1.6 g/kg', note: 'Tối thiểu' },
                    { ratio: 1.8, label: '1.8 g/kg', note: 'Vận động' },
                    { ratio: 2.0, label: '2.0 g/kg', note: 'Tăng cơ' },
                    { ratio: 2.2, label: '2.2 g/kg', note: 'Giảm mỡ' },
                    { ratio: 2.4, label: '2.4 g/kg', note: 'VĐV' },
                  ].map((chip) => {
                    const isSelected = proteinMode === 'RATIO' && parseFloat(proteinRatio) === chip.ratio;
                    return (
                      <button
                        key={chip.ratio}
                        type="button"
                        onClick={() => applyProteinRatio(chip.ratio)}
                        className={`py-1 px-0.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-macro-protein text-white font-bold border-macro-protein shadow-md shadow-macro-protein/20 scale-105'
                            : 'bg-[#1A1D2A] text-gray-400 hover:text-white border-border hover:border-gray-600'
                        }`}
                      >
                        <span className="block text-[11px]">{chip.label}</span>
                        <span className="block text-[8px] opacity-75 font-sans">{chip.note}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3 Macro Inputs */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Column 1: Đạm (Protein) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-macro-protein flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-macro-protein" />
                      {proteinMode === 'RATIO' ? 'Đạm (g/kg)' : 'Đạm (g)'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setProteinMode(proteinMode === 'RATIO' ? 'GRAMS' : 'RATIO')}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-[#202538] text-gray-400 hover:text-white transition-colors"
                      title="Bấm để đổi chế độ nhập g/kg hoặc gram"
                    >
                      {proteinMode === 'RATIO' ? 'Dùng g' : 'Dùng g/kg'}
                    </button>
                  </div>

                  {proteinMode === 'RATIO' ? (
                    <div>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="4.0"
                        value={proteinRatio}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProteinRatio(val);
                          const r = parseFloat(val) || 0;
                          setProteinG(String(Math.round(r * currentWeight)));
                        }}
                        className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-2 py-2 text-sm text-white font-mono text-center font-bold focus:border-macro-protein outline-none"
                      />
                      <span className="text-[10px] text-gray-300 font-mono block text-center mt-1">
                        = <strong className="text-white">{pVal}g</strong> ({Math.round(pVal * 4)} kcal)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="number"
                        min="20"
                        max="500"
                        value={proteinG}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProteinG(val);
                          const g = parseFloat(val) || 0;
                          setProteinRatio(String(Math.round((g / currentWeight) * 10) / 10));
                        }}
                        className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-2 py-2 text-sm text-white font-mono text-center font-bold focus:border-macro-protein outline-none"
                      />
                      <span className="text-[10px] text-gray-300 font-mono block text-center mt-1">
                        = <strong className="text-white">{proteinRatio} g/kg</strong> ({Math.round(pVal * 4)} kcal)
                      </span>
                    </div>
                  )}
                </div>

                {/* Column 2: Carb (g) */}
                <div>
                  <div className="flex items-center mb-1 h-[19px]">
                    <label className="text-[11px] font-semibold text-macro-carbs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-macro-carbs" />
                      Carb (g)
                    </label>
                  </div>
                  <input
                    type="number"
                    min="20"
                    max="800"
                    value={carbsG}
                    onChange={(e) => setCarbsG(e.target.value)}
                    className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-2 py-2 text-sm text-white font-mono text-center font-bold focus:border-macro-carbs outline-none"
                  />
                  <span className="text-[10px] text-gray-400 block text-center mt-1 font-mono">
                    {Math.round(cVal * 4)} kcal
                  </span>
                </div>

                {/* Column 3: Béo (g) */}
                <div>
                  <div className="flex items-center mb-1 h-[19px]">
                    <label className="text-[11px] font-semibold text-macro-fat flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-macro-fat" />
                      Béo (g)
                    </label>
                  </div>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={fatG}
                    onChange={(e) => setFatG(e.target.value)}
                    className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-2 py-2 text-sm text-white font-mono text-center font-bold focus:border-macro-fat outline-none"
                  />
                  <span className="text-[10px] text-gray-400 block text-center mt-1 font-mono">
                    {Math.round(fVal * 9)} kcal
                  </span>
                </div>
              </div>

              {/* Total Calorie Preview */}
              <div className="p-3 bg-[#161926] border border-border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Tổng năng lượng tương ứng:</span>
                  <span className="text-[10px] text-gray-500">
                    Đạm {Math.round(((pVal * 4) / (calculatedCustomCals || 1)) * 100)}% • Carb {Math.round(((cVal * 4) / (calculatedCustomCals || 1)) * 100)}% • Béo {Math.round(((fVal * 9) / (calculatedCustomCals || 1)) * 100)}%
                  </span>
                </div>
                <span className="text-sm font-extrabold text-white font-mono">
                  {calculatedCustomCals} <span className="text-xs text-gray-400 font-normal">kcal/ngày</span>
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-[11px] text-gray-400 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-emerald" />
                  Mẫu phân bổ nhanh theo trường phái:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => applyPreset(0.35, 0.45, 0.20)}
                    className="p-1.5 rounded-xl bg-[#1A1D2A] hover:bg-[#232738] text-gray-300 font-medium text-center"
                  >
                    🏋️ Gym / Tăng cơ
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(0.25, 0.50, 0.25)}
                    className="p-1.5 rounded-xl bg-[#1A1D2A] hover:bg-[#232738] text-gray-300 font-medium text-center"
                  >
                    ⚖️ Cân bằng
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(0.35, 0.25, 0.40)}
                    className="p-1.5 rounded-xl bg-[#1A1D2A] hover:bg-[#232738] text-gray-300 font-medium text-center"
                  >
                    🥑 Low Carb / Cut
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#161926] border border-border rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Chế độ hiện tại:</span>
                <span className="font-semibold text-brand-blue">Tự động tính theo TDEE & Thể trạng</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-macro-protein">{profile?.targetProteinG || 140}g Đạm (2.0g/kg)</span>
                <span className="text-macro-carbs">{profile?.targetCarbsG || 200}g Carb</span>
                <span className="text-macro-fat">{profile?.targetFatG || 60}g Béo</span>
              </div>
            </div>
          )}
        </div>

        {/* Mục 3: Cấu hình Dashboard & Widgets */}
        <div className="bg-card border border-border rounded-3xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-brand-purple" />
            Tùy biến Widget Trang chủ (YAZIO Modular)
          </h4>

          {/* Toggle Fasting Widget */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#161926]">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-brand-purple" />
              <span className="text-xs text-white font-semibold">Đồng hồ Nhịn ăn Gián đoạn</span>
            </div>
            <input
              type="checkbox"
              checked={showFasting}
              onChange={(e) => setShowFasting(e.target.checked)}
              className="w-4 h-4 rounded text-brand-purple focus:ring-brand-purple bg-[#1A1D2A] border-border"
            />
          </div>

          {/* Toggle Water Widget */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#161926]">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-brand-cyan" />
              <span className="text-xs text-white font-semibold">Theo dõi Nước uống hàng ngày</span>
            </div>
            <input
              type="checkbox"
              checked={showWater}
              onChange={(e) => setShowWater(e.target.checked)}
              className="w-4 h-4 rounded text-brand-cyan focus:ring-brand-cyan bg-[#1A1D2A] border-border"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-brand-blue text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-brand-blue/90 active:scale-95 transition-all"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" /> Đã cập nhật thành công!
            </>
          ) : (
            'Lưu Hồ Sơ & Cập Nhật Calo / Macro'
          )}
        </button>
      </form>
    </div>
  );
};
