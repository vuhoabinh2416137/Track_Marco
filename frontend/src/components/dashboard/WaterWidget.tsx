'use client';

import React, { useState } from 'react';
import { Droplets, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WaterStatus } from '@/lib/types';
import { api } from '@/lib/api';

interface WaterWidgetProps {
  status: WaterStatus | null;
  onRefresh: () => void;
}

export const WaterWidget: React.FC<WaterWidgetProps> = ({ status, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const total = status?.totalMl || 0;
  const target = status?.targetMl || 2500;
  const percent = status?.progressPercent || 0;

  const handleAdd = async (amount: number) => {
    if (amount <= 0) return;
    setLoading(true);
    try {
      await api.addWater(amount);
      if (total + amount >= target && total < target) {
        // Trigger celebratory confetti when goal achieved!
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#06B6D4', '#3B82F6', '#60A5FA']
        });
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount);
    if (!isNaN(val) && val > 0) {
      handleAdd(val);
      setCustomAmount('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-cyan/15 flex items-center justify-center text-brand-cyan">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Nước Uống Hàng Ngày</h3>
            <p className="text-[11px] text-gray-400">Duy trì chuyển hóa tế bào</p>
          </div>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-base font-extrabold text-white font-mono">{total}</span>
          <span className="text-xs text-gray-400 font-mono">/ {target} ml</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#1A1D2A] h-2.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-gradient-to-r from-brand-cyan to-brand-blue h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>

      {/* Quick Add Preset Buttons */}
      <div className="grid grid-cols-4 gap-1.5 mb-2.5">
        {[
          { label: '+150ml', title: 'Tách trà/cà phê', ml: 150 },
          { label: '+250ml', title: '1 Ly nước', ml: 250 },
          { label: '+330ml', title: '1 Lon nước', ml: 330 },
          { label: '+500ml', title: '1 Chai nước', ml: 500 },
        ].map((preset) => (
          <button
            key={preset.ml}
            type="button"
            onClick={() => handleAdd(preset.ml)}
            disabled={loading}
            title={preset.title}
            className="py-1.5 px-1 rounded-xl bg-[#1A1D2A] hover:bg-brand-cyan/20 text-brand-cyan text-xs font-semibold border border-brand-cyan/20 transition-all active:scale-95 text-center font-mono"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Amount Input Row */}
      <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            min="10"
            max="5000"
            step="10"
            placeholder="Nhập lượng ml tùy ý (vd: 180, 400)..."
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full bg-[#1A1D2A] border border-border rounded-xl px-3 py-1.5 pr-8 text-xs text-white placeholder-gray-500 font-mono focus:border-brand-cyan outline-none"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-mono pointer-events-none">
            ml
          </span>
        </div>
        <button
          type="submit"
          disabled={loading || !customAmount || parseInt(customAmount) <= 0}
          className="px-3.5 py-1.5 rounded-xl bg-brand-cyan text-black text-xs font-bold hover:bg-brand-cyan/90 disabled:opacity-40 disabled:hover:bg-brand-cyan transition-all active:scale-95 flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm ml</span>
        </button>
      </form>
    </div>
  );
};
