
import { UserProfile, RDA } from './types';

export const COMMON_FOODS = [
  "Apple", "Avocado", "Banana", "Blueberries", "Broccoli", "Chicken Breast", 
  "Greek Yogurt", "Egg", "Oatmeal", "Salmon", "Spinach", "Sweet Potato", 
  "Almonds", "Rice", "Quinoa", "Beef", "Tofu", "Lentils", "Orange Juice", 
  "Latte", "Smoothie", "Pasta", "Bread", "Butter", "Salad", "Burrito"
];

export const calculateRDA = (profile: UserProfile): RDA => {
  // Simple Harris-Benedict Equation for BMR
  let bmr = 0;
  if (profile.sex === 'male') {
    bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
  } else {
    bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
  }

  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very-active': 1.9
  };

  let tdee = bmr * activityMultipliers[profile.activityLevel];

  // Adjust for goal
  if (profile.goal === 'weight-loss') tdee -= 500;
  if (profile.goal === 'muscle-gain') tdee += 300;

  return {
    calories: Math.round(tdee),
    protein: Math.round(tdee * 0.25 / 4), // 25% protein
    fat: Math.round(tdee * 0.25 / 9),     // 25% fat
    carbs: Math.round(tdee * 0.50 / 4),    // 50% carbs
    fiber: 30,
    vitaminA: 900, // mcg
    vitaminC: 90,  // mg
    iron: 18,      // mg
    calcium: 1000, // mg
    potassium: 3500 // mg
  };
};

export const MOCK_LOGS = [
  {
    id: '1',
    name: 'Grilled Salmon with Quinoa',
    calories: 450,
    timestamp: Date.now() - 3600000 * 4,
    nutrients: [
      { name: 'Protein', amount: 35, unit: 'g', category: 'macro' },
      { name: 'Fat', amount: 18, unit: 'g', category: 'macro' },
      { name: 'Carbs', amount: 42, unit: 'g', category: 'macro' },
      { name: 'Vitamin D', amount: 15, unit: 'mcg', category: 'micro' },
      { name: 'Iron', amount: 2.1, unit: 'mg', category: 'micro' }
    ]
  },
  {
    id: '2',
    name: 'Greek Yogurt with Berries',
    calories: 220,
    timestamp: Date.now() - 3600000 * 2,
    nutrients: [
      { name: 'Protein', amount: 15, unit: 'g', category: 'macro' },
      { name: 'Fat', amount: 5, unit: 'g', category: 'macro' },
      { name: 'Carbs', amount: 28, unit: 'g', category: 'macro' },
      { name: 'Calcium', amount: 200, unit: 'mg', category: 'micro' }
    ]
  }
];
