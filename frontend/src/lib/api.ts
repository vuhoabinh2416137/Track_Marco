import {
  UserProfile,
  DailySummary,
  MealLog,
  Food,
  WeightLog,
  WaterStatus,
  FastingStatus,
  WorkoutSession,
  WorkoutSet,
  ParsedFoodItem
} from './types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error (${res.status}): ${errorText}`);
  }
  return res.json();
}

export const api = {
  // Profile
  getProfile: () => fetchJson<UserProfile>('/profile'),
  updateProfile: (profile: Partial<UserProfile>) =>
    fetchJson<UserProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  // Diary
  getDailySummary: (date?: string) =>
    fetchJson<DailySummary>(`/diary/summary${date ? `?date=${date}` : ''}`),
  logMeal: (meal: Partial<MealLog>) =>
    fetchJson<MealLog>('/diary/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    }),
  deleteMeal: (id: number) =>
    fetch(`${API_BASE}/diary/meals/${id}`, { method: 'DELETE' }),

  // Foods
  searchFoods: (query?: string) =>
    fetchJson<Food[]>(`/foods/search${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  getFoodByBarcode: (barcode: string) =>
    fetchJson<Food>(`/foods/barcode/${barcode}`),
  createCustomFood: (food: Partial<Food>) =>
    fetchJson<Food>('/foods', {
      method: 'POST',
      body: JSON.stringify(food),
    }),

  // Weights & Expenditure
  getWeightLogs: () => fetchJson<WeightLog[]>('/weights'),
  logWeight: (data: { date?: string; weight: number; notes?: string }) =>
    fetchJson<WeightLog>('/weights', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Water
  getWaterStatus: (date?: string) =>
    fetchJson<WaterStatus>(`/water${date ? `?date=${date}` : ''}`),
  addWater: (amountMl: number, date?: string) =>
    fetchJson<any>('/water', {
      method: 'POST',
      body: JSON.stringify({ amountMl, date }),
    }),

  // Fasting
  getFastingStatus: () => fetchJson<FastingStatus>('/fasting/current'),
  startFasting: (protocol: string, customHours?: number) =>
    fetchJson<any>('/fasting/start', {
      method: 'POST',
      body: JSON.stringify({ protocol, customHours }),
    }),
  stopFasting: () =>
    fetchJson<any>('/fasting/stop', { method: 'POST' }),

  // Workouts
  getWorkouts: (date?: string) =>
    fetchJson<WorkoutSession[]>(`/workouts${date ? `?date=${date}` : ''}`),
  createWorkoutSession: (session: Partial<WorkoutSession>) =>
    fetchJson<WorkoutSession>('/workouts', {
      method: 'POST',
      body: JSON.stringify(session),
    }),
  addSetToSession: (sessionId: number, set: Partial<WorkoutSet>) =>
    fetchJson<WorkoutSession>(`/workouts/${sessionId}/sets`, {
      method: 'POST',
      body: JSON.stringify(set),
    }),
  updateWorkoutSet: (setId: number, set: Partial<WorkoutSet>) =>
    fetchJson<WorkoutSet>(`/workouts/sets/${setId}`, {
      method: 'PUT',
      body: JSON.stringify(set),
    }),
  deleteWorkoutSet: (setId: number) =>
    fetch(`${API_BASE}/workouts/sets/${setId}`, { method: 'DELETE' }),
  deleteWorkoutSession: (sessionId: number) =>
    fetch(`${API_BASE}/workouts/${sessionId}`, { method: 'DELETE' }),

  // AI Natural Language Parser
  parseAiFood: (text: string) =>
    fetchJson<ParsedFoodItem[]>('/ai-parser/parse', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
};
