import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserProfile, 
  Workout, 
  DailyNutrition, 
  Exercise, 
  WorkoutRoutine,
  RoutineBundle,
  DayOfWeek,
  ChatMessage,
  ProgressRecord
} from '../types';

// Storage Keys
const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  WORKOUTS: 'workouts',
  NUTRITION: 'nutrition',
  EXERCISES: 'exercises',
  ROUTINES: 'routines',
  ROUTINE_BUNDLES: 'routine_bundles',
  CHAT_HISTORY: 'chat_history',
  PROGRESS: 'progress',
} as const;

class StorageService {
  // Generic storage methods
  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }

  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  // User Profile methods
  async saveUserProfile(profile: UserProfile): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  async getUserProfile(): Promise<UserProfile | null> {
    return this.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  }

  // Workout methods
  async saveWorkout(workout: Workout): Promise<void> {
    const workouts = await this.getAllWorkouts();
    const updatedWorkouts = [...workouts, workout];
    return this.setItem(STORAGE_KEYS.WORKOUTS, updatedWorkouts);
  }

  async getAllWorkouts(): Promise<Workout[]> {
    const workouts = await this.getItem<Workout[]>(STORAGE_KEYS.WORKOUTS);
    return workouts || [];
  }

  async getWorkoutsByDateRange(startDate: Date, endDate: Date): Promise<Workout[]> {
    const allWorkouts = await this.getAllWorkouts();
    return allWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    const workouts = await this.getAllWorkouts();
    const filteredWorkouts = workouts.filter(w => w.id !== workoutId);
    return this.setItem(STORAGE_KEYS.WORKOUTS, filteredWorkouts);
  }

  // Nutrition methods
  async saveDailyNutrition(nutrition: DailyNutrition): Promise<void> {
    const allNutrition = await this.getAllNutrition();
    const existingIndex = allNutrition.findIndex(
      n => new Date(n.date).toDateString() === new Date(nutrition.date).toDateString()
    );
    
    if (existingIndex >= 0) {
      allNutrition[existingIndex] = nutrition;
    } else {
      allNutrition.push(nutrition);
    }
    
    return this.setItem(STORAGE_KEYS.NUTRITION, allNutrition);
  }

  async getAllNutrition(): Promise<DailyNutrition[]> {
    const nutrition = await this.getItem<DailyNutrition[]>(STORAGE_KEYS.NUTRITION);
    return nutrition || [];
  }

  async getNutritionByDate(date: Date): Promise<DailyNutrition | null> {
    const allNutrition = await this.getAllNutrition();
    return allNutrition.find(
      n => new Date(n.date).toDateString() === date.toDateString()
    ) || null;
  }

  // Exercise methods
  async saveExercises(exercises: Exercise[]): Promise<void> {
    return this.setItem(STORAGE_KEYS.EXERCISES, exercises);
  }

  async getAllExercises(): Promise<Exercise[]> {
    const exercises = await this.getItem<Exercise[]>(STORAGE_KEYS.EXERCISES);
    return exercises || [];
  }

  async getExerciseById(exerciseId: string): Promise<Exercise | null> {
    const exercises = await this.getAllExercises();
    return exercises.find(e => e.id === exerciseId) || null;
  }

  // Sprint 2.2: Custom Exercise Management
  async saveExercise(exercise: Exercise): Promise<void> {
    try {
      if (__DEV__) console.log('🏋️ ExerciseManager - Saving exercise:', exercise.name);
      const exercises = await this.getAllExercises();
      const existingIndex = exercises.findIndex(e => e.id === exercise.id);
      
      if (existingIndex >= 0) {
        exercises[existingIndex] = exercise;
        if (__DEV__) console.log('✏️ ExerciseManager - Updated existing exercise:', exercise.name);
      } else {
        exercises.push(exercise);
        if (__DEV__) console.log('✨ ExerciseManager - Created new exercise:', exercise.name);
      }
      
      return this.setItem(STORAGE_KEYS.EXERCISES, exercises);
    } catch (error) {
      console.error('❌ ExerciseManager - Error saving exercise:', error);
      throw error;
    }
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    try {
      if (__DEV__) console.log('🗑️ ExerciseManager - Deleting exercise:', exerciseId);
      const exercises = await this.getAllExercises();
      const filteredExercises = exercises.filter(e => e.id !== exerciseId);
      return this.setItem(STORAGE_KEYS.EXERCISES, filteredExercises);
    } catch (error) {
      console.error('❌ ExerciseManager - Error deleting exercise:', error);
      throw error;
    }
  }

  async getCustomExercises(): Promise<Exercise[]> {
    try {
      const allExercises = await this.getAllExercises();
      return allExercises.filter(exercise => exercise.isCustom);
    } catch (error) {
      console.error('❌ ExerciseManager - Error fetching custom exercises:', error);
      return [];
    }
  }

  async getDefaultExercises(): Promise<Exercise[]> {
    try {
      const allExercises = await this.getAllExercises();
      return allExercises.filter(exercise => !exercise.isCustom);
    } catch (error) {
      console.error('❌ ExerciseManager - Error fetching default exercises:', error);
      return [];
    }
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    try {
      if (__DEV__) console.log('🔍 ExerciseManager - Searching exercises for:', query);
      const allExercises = await this.getAllExercises();
      const searchTerm = query.toLowerCase().trim();
      
      if (!searchTerm) return allExercises;
      
      return allExercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.category.toLowerCase().includes(searchTerm) ||
        exercise.muscleGroups.some(muscle => muscle.toLowerCase().includes(searchTerm)) ||
        exercise.equipmentNeeded.some(equipment => equipment.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('❌ ExerciseManager - Error searching exercises:', error);
      return [];
    }
  }

  async filterExercisesByCategory(category: string): Promise<Exercise[]> {
    try {
      const allExercises = await this.getAllExercises();
      return allExercises.filter(exercise => exercise.category === category);
    } catch (error) {
      console.error('❌ ExerciseManager - Error filtering by category:', error);
      return [];
    }
  }

  async filterExercisesByEquipment(equipment: string[]): Promise<Exercise[]> {
    try {
      const allExercises = await this.getAllExercises();
      if (equipment.length === 0) return allExercises;
      
      return allExercises.filter(exercise => 
        equipment.every(eq => exercise.equipmentNeeded.includes(eq)) ||
        (equipment.includes('bodyweight') && exercise.equipmentNeeded.length === 0)
      );
    } catch (error) {
      console.error('❌ ExerciseManager - Error filtering by equipment:', error);
      return [];
    }
  }

  async updateExerciseUsage(exerciseId: string): Promise<void> {
    try {
      if (__DEV__) console.log('📈 ExerciseManager - Updating usage for exercise:', exerciseId);
      const exercises = await this.getAllExercises();
      const exerciseIndex = exercises.findIndex(e => e.id === exerciseId);
      
      if (exerciseIndex >= 0) {
        exercises[exerciseIndex] = {
          ...exercises[exerciseIndex],
          usageCount: (exercises[exerciseIndex].usageCount || 0) + 1,
          lastUsed: new Date()
        };
        
        return this.setItem(STORAGE_KEYS.EXERCISES, exercises);
      }
    } catch (error) {
      console.error('❌ ExerciseManager - Error updating exercise usage:', error);
    }
  }

  // Routine methods
  async saveRoutine(routine: WorkoutRoutine): Promise<void> {
    const routines = await this.getAllRoutines();
    const existingIndex = routines.findIndex(r => r.id === routine.id);
    
    if (existingIndex >= 0) {
      routines[existingIndex] = routine;
    } else {
      routines.push(routine);
    }
    
    return this.setItem(STORAGE_KEYS.ROUTINES, routines);
  }

  async getAllRoutines(): Promise<WorkoutRoutine[]> {
    const routines = await this.getItem<WorkoutRoutine[]>(STORAGE_KEYS.ROUTINES);
    return routines || [];
  }

  async getRoutineById(routineId: string): Promise<WorkoutRoutine | null> {
    const routines = await this.getAllRoutines();
    return routines.find(r => r.id === routineId) || null;
  }

  async deleteRoutine(routineId: string): Promise<void> {
    const routines = await this.getAllRoutines();
    const filteredRoutines = routines.filter(r => r.id !== routineId);
    return this.setItem(STORAGE_KEYS.ROUTINES, filteredRoutines);
  }

  // Routine Bundle methods
  async saveRoutineBundle(bundle: RoutineBundle): Promise<void> {
    try {
      console.log('💾 Saving routine bundle:', bundle.name);
      const bundles = await this.getAllRoutineBundles();
      const existingIndex = bundles.findIndex(b => b.id === bundle.id);
      
      // If setting as default, unset other defaults
      if (bundle.isDefault) {
        bundles.forEach(b => { b.isDefault = false; });
        console.log('🎯 Setting as default bundle:', bundle.name);
      }
      
      if (existingIndex >= 0) {
        bundles[existingIndex] = bundle;
        console.log('✏️ Updated existing bundle:', bundle.name);
      } else {
        bundles.push(bundle);
        console.log('✨ Created new bundle:', bundle.name);
      }
      
      return this.setItem(STORAGE_KEYS.ROUTINE_BUNDLES, bundles);
    } catch (error) {
      console.error('❌ Error saving routine bundle:', error);
      throw error;
    }
  }

  async getAllRoutineBundles(): Promise<RoutineBundle[]> {
    try {
      const bundles = await this.getItem<RoutineBundle[]>(STORAGE_KEYS.ROUTINE_BUNDLES);
      return bundles || [];
    } catch (error) {
      console.error('❌ Error fetching routine bundles:', error);
      return [];
    }
  }

  async getRoutineBundleById(bundleId: string): Promise<RoutineBundle | null> {
    try {
      const bundles = await this.getAllRoutineBundles();
      return bundles.find(b => b.id === bundleId) || null;
    } catch (error) {
      console.error('❌ Error fetching routine bundle by ID:', error);
      return null;
    }
  }

  async getDefaultRoutineBundle(): Promise<RoutineBundle | null> {
    try {
      const bundles = await this.getAllRoutineBundles();
      const defaultBundle = bundles.find(b => b.isDefault);
      console.log('🎯 Default bundle:', defaultBundle?.name || 'None set');
      return defaultBundle || null;
    } catch (error) {
      console.error('❌ Error fetching default routine bundle:', error);
      return null;
    }
  }

  async setDefaultRoutineBundle(bundleId: string): Promise<void> {
    try {
      console.log('🎯 Setting new default bundle:', bundleId);
      const bundles = await this.getAllRoutineBundles();
      
      // Unset all defaults and set the new one
      bundles.forEach(bundle => {
        bundle.isDefault = bundle.id === bundleId;
      });
      
      return this.setItem(STORAGE_KEYS.ROUTINE_BUNDLES, bundles);
    } catch (error) {
      console.error('❌ Error setting default routine bundle:', error);
      throw error;
    }
  }

  async deleteRoutineBundle(bundleId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting routine bundle:', bundleId);
      const bundles = await this.getAllRoutineBundles();
      const filteredBundles = bundles.filter(b => b.id !== bundleId);
      return this.setItem(STORAGE_KEYS.ROUTINE_BUNDLES, filteredBundles);
    } catch (error) {
      console.error('❌ Error deleting routine bundle:', error);
      throw error;
    }
  }

  async getTodaysRoutine(): Promise<WorkoutRoutine | null> {
    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;
      console.log('📅 Getting routine for today:', today);
      
      const defaultBundle = await this.getDefaultRoutineBundle();
      if (!defaultBundle) {
        console.log('⚠️ No default bundle set');
        return null;
      }
      
      const todaysRoutineId = defaultBundle.routineSchedule[today];
      if (!todaysRoutineId) {
        console.log('😴 No routine scheduled for today (rest day)');
        return null;
      }
      
      const routine = await this.getRoutineById(todaysRoutineId);
      console.log('💪 Today\'s routine:', routine?.name || 'Not found');
      return routine;
    } catch (error) {
      console.error('❌ Error getting today\'s routine:', error);
      return null;
    }
  }

  // Enhanced routine methods
  async getRoutinesByIds(routineIds: string[]): Promise<WorkoutRoutine[]> {
    try {
      const allRoutines = await this.getAllRoutines();
      return allRoutines.filter(routine => routineIds.includes(routine.id));
    } catch (error) {
      console.error('❌ Error fetching routines by IDs:', error);
      return [];
    }
  }

  async getCustomRoutines(): Promise<WorkoutRoutine[]> {
    try {
      const allRoutines = await this.getAllRoutines();
      return allRoutines.filter(routine => routine.isCustom);
    } catch (error) {
      console.error('❌ Error fetching custom routines:', error);
      return [];
    }
  }

  async getPopularExercises(limit: number = 20): Promise<Exercise[]> {
    try {
      const allExercises = await this.getAllExercises();
      return allExercises
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Error fetching popular exercises:', error);
      return [];
    }
  }

  // Chat methods
  async saveChatMessage(message: ChatMessage): Promise<void> {
    const chatHistory = await this.getChatHistory();
    const updatedHistory = [...chatHistory, message];
    return this.setItem(STORAGE_KEYS.CHAT_HISTORY, updatedHistory);
  }

  async getChatHistory(): Promise<ChatMessage[]> {
    const chatHistory = await this.getItem<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY);
    return chatHistory || [];
  }

  async clearChatHistory(): Promise<void> {
    return this.setItem(STORAGE_KEYS.CHAT_HISTORY, []);
  }

  // Progress methods
  async saveProgressRecord(record: ProgressRecord): Promise<void> {
    const progress = await this.getAllProgress();
    const updatedProgress = [...progress, record];
    return this.setItem(STORAGE_KEYS.PROGRESS, updatedProgress);
  }

  async getAllProgress(): Promise<ProgressRecord[]> {
    const progress = await this.getItem<ProgressRecord[]>(STORAGE_KEYS.PROGRESS);
    return progress || [];
  }

  async getProgressByExercise(exerciseId: string): Promise<ProgressRecord[]> {
    const allProgress = await this.getAllProgress();
    return allProgress.filter(p => p.exerciseId === exerciseId);
  }

  async clearAllProgress(): Promise<void> {
    return this.setItem(STORAGE_KEYS.PROGRESS, []);
  }

  async clearAllWorkouts(): Promise<void> {
    return this.setItem(STORAGE_KEYS.WORKOUTS, []);
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map(key => this.removeItem(key)));
  }

  async exportData(): Promise<string> {
    const data = {
      userProfile: await this.getUserProfile(),
      workouts: await this.getAllWorkouts(),
      nutrition: await this.getAllNutrition(),
      exercises: await this.getAllExercises(),
      routines: await this.getAllRoutines(),
      routineBundles: await this.getAllRoutineBundles(),
      chatHistory: await this.getChatHistory(),
      progress: await this.getAllProgress(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.userProfile) await this.saveUserProfile(data.userProfile);
      if (data.workouts) await this.setItem(STORAGE_KEYS.WORKOUTS, data.workouts);
      if (data.nutrition) await this.setItem(STORAGE_KEYS.NUTRITION, data.nutrition);
      if (data.exercises) await this.saveExercises(data.exercises);
      if (data.routines) await this.setItem(STORAGE_KEYS.ROUTINES, data.routines);
      if (data.routineBundles) await this.setItem(STORAGE_KEYS.ROUTINE_BUNDLES, data.routineBundles);
      if (data.chatHistory) await this.setItem(STORAGE_KEYS.CHAT_HISTORY, data.chatHistory);
      if (data.progress) await this.setItem(STORAGE_KEYS.PROGRESS, data.progress);
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const storageService = new StorageService(); 