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
  popularity: number; // 1-100 ranking for popular exercises first
  // Sprint 2.2: Custom exercise support
  isCustom?: boolean; // Distinguish custom vs default exercises
  createdAt?: Date; // When custom exercise was created
  createdBy?: string; // User ID who created the exercise
  usageCount?: number; // Track how often exercise is used
  lastUsed?: Date; // When exercise was last used in a routine
}

// Enhanced Routine Exercise with more configuration
export interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  plannedSets: number;
  plannedReps: number;
  plannedWeight?: number; // Optional default weight
  restTime: number; // Rest time in seconds
  notes?: string;
  order: number; // For exercise ordering in routine
}

// Workout Set
export interface WorkoutSet {
  reps: number;
  weight: number; // in kg
  restTime?: number; // actual rest time taken
  completed: boolean;
  setNumber: number; // Dynamic set numbering
  notes?: string;
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
  description?: string;
  exercises: RoutineExercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  muscleGroups: string[];
  createdAt: Date;
  lastUsed?: Date;
  isCustom: boolean; // Distinguish custom vs default routines
}

// New: Routine Bundle System
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface RoutineBundle {
  id: string;
  name: string;
  description?: string;
  routineSchedule: {
    [key in DayOfWeek]: string | null; // routineId or null for rest days
  };
  isDefault: boolean;
  createdAt: Date;
  lastModified: Date;
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
  timeContext?: {
    currentTime: string;
    timeOfDay: string;
    dayOfWeek: string;
    hour: number;
    isWeekend: boolean;
  };
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Workout: undefined;
  WorkoutMain: undefined;
  RoutineBuilder: {
    editingRoutine?: WorkoutRoutine;
    selectedExercise?: Exercise;
  };
  BundleManager: {
    editingBundle?: RoutineBundle;
  };
  ExerciseManager: {
    editingExercise?: Exercise;
    fromRoutineBuilder?: boolean;
    routineBuilderCallback?: string;
  };
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