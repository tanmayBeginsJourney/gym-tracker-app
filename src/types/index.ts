// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: Array<'strength' | 'muscle' | 'endurance' | 'weight_loss'>;
  createdAt: Date;
  
  // Detailed personal fitness profile
  personalDetails: {
    // Physical characteristics and goals
    targetPhysique: 'lean_muscle' | 'bulk' | 'athletic' | 'powerlifter' | 'endurance';
    bodyFatGoal?: number; // target body fat percentage
    specificGoals: string[]; // e.g., "visible abs", "vascularity", "bigger shoulders"
    
    // Weak points and focus areas
    weakBodyParts: Array<'legs' | 'back' | 'chest' | 'shoulders' | 'arms' | 'core' | 'forearms'>;
    priorityMuscles: string[]; // specific muscles to focus on
    
    // Training preferences
    preferredWorkoutStyle: 'powerlifting' | 'bodybuilding' | 'calisthenics' | 'crossfit' | 'mixed';
    workoutFrequency: number; // days per week
    sessionDuration: number; // preferred minutes per session
    restDayPreferences: string[];
    
    // Limitations and considerations
    injuries: Array<{
      bodyPart: string;
      description: string;
      limitations: string[];
      date: Date;
    }>;
    allergies: string[];
    dietaryRestrictions: string[];
    
    // Personal notes and context
    motivationalFactors: string[]; // what motivates them
    personalChallenges: string[]; // what they struggle with
    additionalNotes: string; // free-form personal context
  };
}

// Exercise Types
export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  muscleGroups: string[];
  instructions: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipmentNeeded: string[];
}

// Workout Set
export interface WorkoutSet {
  reps: number;
  weight: number; // in kg
  restTime?: number; // in seconds
  completed: boolean;
}

// Exercise in Workout
export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
}

// Complete Workout
export interface Workout {
  id: string;
  userId: string;
  date: Date;
  routineId?: string;
  routineName?: string;
  exercises: WorkoutExercise[];
  duration: number; // in minutes
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  energyLevel?: 1 | 2 | 3 | 4 | 5; // 1-5 scale
}

// Workout Routine Template
export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: number;
    targetWeight?: number;
  }>;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  muscleGroups: string[];
}

// Nutrition Types
export interface Food {
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  quantity: number;
  unit: string; // 'grams', 'cups', 'pieces', etc.
}

export interface Meal {
  time: Date;
  name: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Food[];
}

export interface DailyNutrition {
  id: string;
  userId: string;
  date: Date;
  meals: Meal[];
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  waterIntake?: number; // in ml
}

// Progress Tracking
export interface ProgressRecord {
  date: Date;
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxReps: number;
  totalVolume: number; // total weight lifted
}

// AI Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  recentWorkouts: Workout[];
  recentNutrition: DailyNutrition[];
  userGoals: UserProfile['goals'];
  currentStats: {
    totalWorkouts: number;
    averageWorkoutDuration: number;
    strongestLifts: ProgressRecord[];
  };
  // Enhanced context for personalization
  userProfile?: UserProfile;
  workoutHistory?: Workout[];
  dayOfWeek?: string;
  currentTime?: string;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Workout: undefined;
  Progress: undefined;
  Nutrition: undefined;
  Chat: undefined;
  Settings: undefined;
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 