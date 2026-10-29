'use client';

import React, { useState } from 'react';
import { Dumbbell, Plus, Trash2, Award, Info, Check, Pencil, X } from 'lucide-react';
import { WorkoutSession, WorkoutSet } from '@/lib/types';
import { api } from '@/lib/api';

interface WorkoutLoggerProps {
  sessions: WorkoutSession[];
  onRefresh: () => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ sessions, onRefresh }) => {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('45');

  // New Exercise Form State
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [exerciseName, setExerciseName] = useState('Đẩy ngực đòn (Barbell Bench Press)');
  const [weightKg, setWeightKg] = useState('60');
  const [reps, setReps] = useState('8');
  const [rpe, setRpe] = useState('8.5');

  // Edit Exercise State
  const [editingSetId, setEditingSetId] = useState<number | null>(null);
  const [editExerciseName, setEditExerciseName] = useState('');
  const [editWeightKg, setEditWeightKg] = useState('60');
  const [editReps, setEditReps] = useState('8');
  const [editRpe, setEditRpe] = useState('8.5');

  const popularExercises = [
    'Đẩy ngực đòn (Bench Press)',
    'Incline Machine Chest Press',
    'Squat gánh tạ đòn',
    'Deadlift kéo tạ',
    'Kéo xà đơn (Pull-up)',
    'Đẩy vai tạ đơn (Shoulder Press)',
    'Kéo cáp xô (Lat Pulldown)',
    'Cuốn tay trước (Bicep Curl)',
  ];

  const calc1RM = (w: number, r: number) => {
    if (w <= 0 || r <= 0) return 0;
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30.0) * 10) / 10;
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;

    try {
      await api.createWorkoutSession({
        name: sessionName.trim(),
        durationMinutes: parseInt(durationMinutes) || 45,
        sets: [],
      });
      setSessionName('');
      setIsCreatingSession(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExercise = async (sessionId: number) => {
    const w = parseFloat(weightKg) || 0;
    const r = parseInt(reps) || 0;
    if (!exerciseName.trim() || w <= 0 || r <= 0) return;

    try {
      await api.addSetToSession(sessionId, {
        exerciseName: exerciseName.trim(),
        weightKg: w,
        reps: r,
        rpe: parseFloat(rpe) || 8.0,
      });
      setActiveSessionId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditingSet = (set: WorkoutSet) => {
    setEditingSetId(set.id || null);
    setEditExerciseName(set.exerciseName);
    setEditWeightKg(String(set.weightKg));
    setEditReps(String(set.reps));
    setEditRpe(String(set.rpe || 8.0));
  };

  const handleUpdateSet = async (setId: number) => {
    const w = parseFloat(editWeightKg) || 0;
    const r = parseInt(editReps) || 0;
    if (!editExerciseName.trim() || w <= 0 || r <= 0) return;

    try {
      await api.updateWorkoutSet(setId, {
        exerciseName: editExerciseName.trim(),
        weightKg: w,
        reps: r,
        rpe: parseFloat(editRpe) || 8.0,
      });
      setEditingSetId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSet = async (setId: number) => {
    if (!confirm('Xóa bài tập này?')) return;
    try {
      await api.deleteWorkoutSet(setId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Xóa toàn bộ buổi tập này?')) return;
    try {
      await api.deleteWorkoutSession(sessionId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Closed Loop Science Banner */}
      <div className="p-3.5 bg-brand-emerald/10 border border-brand-emerald/30 rounded-3xl flex items-start gap-2.5 text-xs text-brand-emerald">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold">Định luật Bảo toàn Năng lượng (MacroFactor):</span> Bạn không cần và không nên "ăn bù calo tập luyện". Toàn bộ lượng tiêu hao từ tạ sẽ tự động phản ánh vào TDEE động và xu hướng cân nặng!
        </div>
      </div>

      {/* Header + Add Session Button */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-brand-blue" />
          Nhật ký Kháng Lực & Thể Hình
        </h3>
        <button
          onClick={() => setIsCreatingSession(!isCreatingSession)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Tạo buổi tập mới
        </button>
      </div>

      {/* Create Session Form */}
      {isCreatingSession && (
        <form onSubmit={handleCreateSession} className="bg-card border border-border rounded-3xl p-4 space-y-3 animate-in slide-in-from-top">
          <h4 className="text-xs font-bold text-white">Tên buổi tập mới</h4>
          <input
            type="text"
            required
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Ví dụ: Ngực & Tay sau, Chân & Bụng, Lưng & Xô..."
            className="w-full bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-blue font-medium"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="Thời lượng (phút)"
              className="w-36 bg-[#1A1D2A] border border-border rounded-2xl px-3.5 py-2 text-sm text-white font-mono"
            />
            <button
              type="submit"
              className="flex-1 py-2 rounded-2xl bg-brand-blue text-white font-bold text-xs hover:bg-brand-blue/90 transition-colors"
            >
              Lưu buổi tập
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingSession(false)}
              className="px-3.5 py-2 rounded-2xl bg-[#1A1D2A] text-gray-400 text-xs hover:text-white"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Workout Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-card border border-border rounded-3xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">{session.name}</h4>
                <p className="text-[11px] text-gray-400">
                  {session.sessionDate} • {session.durationMinutes} phút • <strong className="text-brand-blue">{session.sets?.length || 0} bài tập</strong>
                </p>
              </div>
              <button
                onClick={() => handleDeleteSession(session.id!)}
                title="Xóa buổi tập"
                className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Exercises List */}
            {session.sets && session.sets.length > 0 && (
              <div className="space-y-2">
                {session.sets.map((set, idx) => {
                  const isEditing = editingSetId === set.id;

                  if (isEditing) {
                    return (
                      <div
                        key={set.id || idx}
                        className="p-3.5 bg-[#1B1F30] rounded-2xl border border-brand-blue/60 space-y-3 text-xs shadow-md animate-in fade-in"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brand-blue text-xs flex items-center gap-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                            Chỉnh sửa bài tập #{idx + 1}
                          </span>
                          <span className="text-[10px] text-brand-emerald font-mono font-semibold">
                            1RM ước tính: ~{calc1RM(parseFloat(editWeightKg) || 0, parseInt(editReps) || 0)} kg
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 block mb-1 font-semibold">Tên bài tập *</label>
                          <input
                            type="text"
                            required
                            value={editExerciseName}
                            onChange={(e) => setEditExerciseName(e.target.value)}
                            className="w-full bg-[#12141D] border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-0.5 font-medium">Mức tạ (kg)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={editWeightKg}
                              onChange={(e) => setEditWeightKg(e.target.value)}
                              className="w-full bg-[#12141D] border border-border rounded-xl px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-brand-blue"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-0.5 font-medium">Số lần (reps)</label>
                            <input
                              type="number"
                              value={editReps}
                              onChange={(e) => setEditReps(e.target.value)}
                              className="w-full bg-[#12141D] border border-border rounded-xl px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-brand-blue"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-0.5 font-medium">RPE (6-10)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={editRpe}
                              onChange={(e) => setEditRpe(e.target.value)}
                              className="w-full bg-[#12141D] border border-border rounded-xl px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-brand-blue"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => set.id && handleUpdateSet(set.id)}
                            className="flex-1 py-1.5 rounded-xl bg-brand-emerald text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:brightness-110 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Lưu thay đổi
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSetId(null)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#12141D] hover:bg-[#1A1D2A] text-gray-400 text-xs transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={set.id || idx}
                      className="p-3 bg-[#161926] rounded-2xl border border-border/50 space-y-2 text-xs hover:border-border transition-colors"
                    >
                      {/* Row 1: Exercise Index & Name + Edit/Delete Buttons */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-lg bg-[#1F2437] flex items-center justify-center font-mono text-[10px] text-brand-blue font-bold shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-white text-[13px] leading-tight break-words">
                            {set.exerciseName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditingSet(set)}
                            title="Chỉnh sửa bài tập (sửa tên, số rep, tạ)"
                            className="p-1.5 rounded-lg bg-[#1F2437] hover:bg-brand-blue hover:text-white text-gray-300 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => set.id && handleDeleteSet(set.id)}
                            title="Xóa bài tập này"
                            className="p-1.5 rounded-lg bg-[#1F2437] hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Row 2: Weight, Reps, RPE & 1RM */}
                      <div className="flex items-center justify-between pt-0.5 border-t border-border/30">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white font-bold text-xs bg-[#1A1D2A] px-2.5 py-0.5 rounded-lg border border-border/60">
                            {set.weightKg} kg × {set.reps} reps
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            RPE: <strong className="text-gray-300">{set.rpe || 8}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-blue/15 text-brand-blue font-mono font-bold text-[10px]">
                          <Award className="w-3 h-3" />
                          1RM: {set.estimated1RM}kg
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Exercise Form / Trigger Button */}
            {activeSessionId === session.id ? (
              <div className="p-3.5 bg-[#161926] rounded-2xl border border-border space-y-2.5 pt-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-brand-blue" />
                    Thêm bài tập mới vào buổi tập
                  </span>
                  <span className="text-[10px] text-brand-emerald font-mono font-semibold">
                    1RM ước tính: ~{calc1RM(parseFloat(weightKg) || 0, parseInt(reps) || 0)} kg
                  </span>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1 font-semibold">Tên bài tập cụ thể *</label>
                  <input
                    type="text"
                    required
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    placeholder="Gõ tên bài tập (VD: Incline Machine Chest Press, Barbell Squat...)"
                    className="w-full bg-[#1A1D2A] border border-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue transition-colors font-medium"
                  />
                  {/* Quick suggestion chips */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {popularExercises.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setExerciseName(ex)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                          exerciseName === ex
                            ? 'bg-brand-blue/20 border-brand-blue text-brand-blue font-bold'
                            : 'bg-[#12141D] border-border/80 text-gray-400 hover:text-white'
                        }`}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5 font-medium">Mức tạ (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full bg-[#1A1D2A] border border-border rounded-xl px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5 font-medium">Số lần (reps)</label>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="w-full bg-[#1A1D2A] border border-border rounded-xl px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5 font-medium">RPE (6-10)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={rpe}
                      onChange={(e) => setRpe(e.target.value)}
                      className="w-full bg-[#1A1D2A] border border-border rounded-xl px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAddExercise(session.id!)}
                    className="flex-1 py-1.5 rounded-xl bg-brand-emerald text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:brightness-110 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Thêm bài tập
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSessionId(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1A1D2A] text-gray-400 text-xs hover:text-white transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveSessionId(session.id!)}
                className="w-full py-2.5 rounded-2xl bg-[#1A1D2A] hover:bg-[#222638] text-brand-blue text-xs font-semibold flex items-center justify-center gap-1.5 border border-dashed border-border hover:border-brand-blue/50 transition-all"
              >
                <Plus className="w-4 h-4" /> Thêm bài tập
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
