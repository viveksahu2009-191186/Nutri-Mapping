
export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  category: 'macro' | 'micro';
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  nutrients: Nutrient[];
  timestamp: number;
}

export interface UserProfile {
  age: number;
  sex: 'male' | 'female' | 'other';
  weight: number; // in kg
  height: number; // in cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  goal: 'weight-loss' | 'maintenance' | 'muscle-gain' | 'deficiency-management';
}

export interface RDA {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  vitaminA: number;
  vitaminC: number;
  iron: number;
  calcium: number;
  potassium: number;
}

export interface AnalysisResult {
  items: Array<{
    name: string;
    portion: string;
    calories: number;
    macros: {
      protein: number;
      fat: number;
      carbs: number;
    };
    micros: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  }>;
  summary: string;
  gapAnalysis: string;
}
