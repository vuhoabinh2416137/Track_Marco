'use client';

import React, { useState } from 'react';
import { Timer, Zap, Play, Square, Sparkles } from 'lucide-react';
import { FastingStatus } from '@/lib/types';
import { api } from '@/lib/api';

interface FastingWidgetProps {
  status: FastingStatus | null;
  onRefresh: () => void;
}

export const FastingWidget: React.FC<FastingWidgetProps> = ({ status, onRefresh }) => {
  const [selectedProtocol, setSelectedProtocol] = useState('16_8');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.startFasting(selectedProtocol);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!confirm('Bạn có chắc chắn muốn kết thúc phiên nhịn ăn hiện tại?')) return;
    setLoading(true);
    try {
      await api.stopFasting();
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatHoursMins = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins < 10 ? '0' : ''}${mins}m`;
  };

  const getStageColor = (stage?: string) => {
    switch (stage) {
      case 'AUTOPHAGY':
        return 'text-brand-purple border-brand-purple/40 bg-brand-purple/10';
      case 'KETOSIS':
        return 'text-brand-amber border-brand-amber/40 bg-brand-amber/10';
      case 'BLOOD_SUGAR_NORMALIZING':
        return 'text-brand-cyan border-brand-cyan/40 bg-brand-cyan/10';
      default:
        return 'text-gray-400 border-gray-700 bg-gray-800/40';
    }
  };

  const getStageLabel = (stage?: string) => {
    switch (stage) {
      case 'AUTOPHAGY':
        return 'Tự thực bào (Autophagy)';
      case 'KETOSIS':
        return 'Đang đốt mỡ (Ketosis)';
      case 'BLOOD_SUGAR_NORMALIZING':
        return 'Hạ Insulin & Đường huyết';
      default:
        return 'Cửa sổ nạp thức ăn (Fed)';
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-purple/15 flex items-center justify-center text-brand-purple">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Nhịn ăn Gián đoạn (Fasting)</h3>
            <p className="text-[11px] text-gray-400">
              {status?.active ? `Nghỉ ngơi tiêu hóa (${status.session?.protocol.replace('_', ':')})` : 'Chưa kích hoạt'}
            </p>
          </div>
        </div>

        {status?.active ? (
          <button
            onClick={handleStop}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Kết thúc
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-purple text-white text-xs font-semibold hover:bg-brand-purple/90 shadow-md transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Bắt đầu
          </button>
        )}
      </div>

      {status?.active ? (
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="w-full bg-[#1A1D2A] h-3 rounded-full overflow-hidden p-0.5 border border-border/50">
            <div
              className="bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-rose h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, status.progressPercent)}%` }}
            />
          </div>

          {/* Time statistics */}
          <div className="flex justify-between items-baseline text-xs">
            <div>
              <span className="text-[11px] text-gray-400">Đã trôi qua: </span>
              <span className="font-mono font-bold text-white text-sm">
                {formatHoursMins(status.elapsedMinutes)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-gray-400">Còn lại: </span>
              <span className="font-mono font-bold text-brand-purple text-sm">
                {formatHoursMins(status.remainingMinutes)}
              </span>
            </div>
          </div>

          {/* Biological Stage Badge */}
          <div className={`p-2.5 rounded-2xl border flex items-start gap-2.5 ${getStageColor(status.stage)}`}>
            <Zap className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold tracking-tight">{getStageLabel(status.stage)}</p>
              <p className="text-[11px] opacity-90 mt-0.5">{status.stageDescription}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1.5">
            {['14_10', '16_8', '18_6'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedProtocol(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  selectedProtocol === p
                    ? 'bg-brand-purple text-white shadow-sm'
                    : 'bg-[#1A1D2A] text-gray-400 hover:text-white'
                }`}
              >
                {p.replace('_', ':')}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-purple" />
            Chọn phác đồ
          </span>
        </div>
      )}
    </div>
  );
};
