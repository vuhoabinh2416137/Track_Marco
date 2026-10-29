export interface UserProfile {
  id?: number;
  name: string;
  gender: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  goalType: 'CUT' | 'MAINTAIN' | 'BULK';
  weeklyGoalRate: number;
  estimatedTdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  customMacro?: boolean;
  proteinRatioPerKg?: number;
  waterTargetMl: number;
  fastingProtocol: string;
  showFastingWidget: boolean;
  showWaterWidget: boolean;
  updatedAt?: string;
}

export interface Food {
  id?: number;
  barcode?: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  source?: string;
  isVerified?: boolean;
}

export interface MealLog {
  id?: number;
  logDate: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foodName: string;
  foodId?: number;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  loggedAt?: string;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  remainingCalories: number;
  mealsByType: Record<string, MealLog[]>;
}

export interface WeightLog {
  id?: number;
  logDate: string;
  scaleWeight: number;
  trendWeight: number;
  notes?: string;
}

export interface WaterStatus {
  date: string;
  totalMl: number;
  targetMl: number;
  progressPercent: number;
  logs: { id: number; amountMl: number; loggedAt: string }[];
}

export interface FastingStatus {
  active: boolean;
  session?: {
    id: number;
    protocol: string;
    startTime: string;
    targetEndTime: string;
  };
  elapsedMinutes: number;
  targetMinutes: number;
  remainingMinutes: number;
  progressPercent: number;
  stage: 'FED' | 'BLOOD_SUGAR_NORMALIZING' | 'KETOSIS' | 'AUTOPHAGY';
  stageDescription: string;
}

export interface WorkoutSet {
  id?: number;
  exerciseName: string;
  targetMuscle?: string;
  setOrder?: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  estimated1RM?: number;
}

export interface WorkoutSession {
  id?: number;
  sessionDate: string;
  name: string;
  durationMinutes: number;
  notes?: string;
  sets: WorkoutSet[];
}

export interface ParsedFoodItem {
  originalQuery: string;
  matchedFoodName: string;
  foodId?: number;
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: number;
}
