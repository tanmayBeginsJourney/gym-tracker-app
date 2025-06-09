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
  ProgressRecord,
  StorageMode,
  DemoProfile,
  ActiveWorkoutSession
} from '../types';
import { demoDataService } from './demoDataService';

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
  STORAGE_MODE: 'storage_mode', // New: Track current mode
  ACTIVE_WORKOUT: 'active_workout', // New: Track active workout session
} as const;

class StorageService {
  // Demo Profile System
  private currentMode: StorageMode = { type: 'real' };
  private currentDemoProfile: DemoProfile | null = null;
  private userAdditions: { [profileId: string]: Workout[] } = {}; // User-added workouts for demo profiles
  
  // Race condition protection: Queue for exercise save operations
  private exerciseSaveQueue: Promise<void> = Promise.resolve();
  
  // Performance optimization: Cache for frequently accessed filtered results
  private customExercisesCache: Exercise[] | null = null;
  private defaultExercisesCache: Exercise[] | null = null;

  // Cache management methods
  private invalidateExerciseCache(): void {
    this.customExercisesCache = null;
    this.defaultExercisesCache = null;
  }

  // Demo Profile System Methods
  async switchToProfile(mode: StorageMode): Promise<void> {
    console.log('🔄 StorageService - Switching to mode:', mode);
    this.currentMode = mode;
    
    if (mode.type === 'demo' && mode.profileId) {
      this.currentDemoProfile = demoDataService.getDemoProfile(mode.profileId);
      console.log('📊 StorageService - Loaded demo profile:', this.currentDemoProfile?.name);
    } else {
      this.currentDemoProfile = null;
      
      // When switching to real mode, clean up any contaminated demo data
      if (mode.type === 'real') {
        await this.cleanupRealProfileData();
      }
      
      // Clean up memory for demo profile user additions
      this.cleanupDemoMemory();
    }
    
    // Save current mode to storage
    await this.setItem(STORAGE_KEYS.STORAGE_MODE, mode);
    
    // Clear caches when switching modes
    this.invalidateExerciseCache();
  }

  private cleanupDemoMemory(): void {
    // Clean up demo profile user additions to prevent memory leaks
    const oldProfileCount = Object.keys(this.userAdditions).length;
    this.userAdditions = {};
    if (oldProfileCount > 0) {
      console.log(`🧹 Cleaned up ${oldProfileCount} demo profile(s) from memory`);
    }
  }

  async getCurrentMode(): Promise<StorageMode> {
    if (this.currentMode.type === 'real') {
      // Try to load from storage on first access
      const savedMode = await this.getItem<StorageMode>(STORAGE_KEYS.STORAGE_MODE);
      if (savedMode) {
        this.currentMode = savedMode;
        if (savedMode.type === 'demo' && savedMode.profileId) {
          this.currentDemoProfile = demoDataService.getDemoProfile(savedMode.profileId);
        }
      }
    }
    return this.currentMode;
  }

  async getSavedStorageMode(): Promise<StorageMode | null> {
    return this.getItem<StorageMode>(STORAGE_KEYS.STORAGE_MODE);
  }

  getCurrentDemoProfile(): DemoProfile | null {
    return this.currentDemoProfile;
  }

  isInDemoMode(): boolean {
    return this.currentMode.type === 'demo';
  }

  async resetToProfileSelection(): Promise<void> {
    console.log('🔄 StorageService - Resetting to profile selection');
    this.currentMode = { type: 'real' };
    this.currentDemoProfile = null;
    await this.removeItem(STORAGE_KEYS.STORAGE_MODE);
  }

  // Clean up contaminated real profile data
  async cleanupRealProfileData(): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ Cannot cleanup data while in demo mode');
      return;
    }
    
    console.log('🧹 Cleaning up contaminated real profile data...');
    
    // Check for demo-profile contaminated bundles and remove them
    const bundles = await this.getItem<RoutineBundle[]>(STORAGE_KEYS.ROUTINE_BUNDLES);
    if (bundles && bundles.length > 0) {
      // Look for bundles that belong to demo profiles (contain demo profile IDs or names)
      const cleanBundles = bundles.filter(bundle => {
        const isDemoBundle = bundle.id.includes('demo-') || 
                           bundle.name.includes('Emma') ||
                           bundle.name.includes('Tanmay') ||
                           bundle.name.includes('Alex') ||
                           bundle.name.includes('Maya') ||
                           bundle.id.includes('emma-') ||
                           bundle.id.includes('tanmay-') ||
                           bundle.id.includes('alex-') ||
                           bundle.id.includes('maya-');
        
        if (isDemoBundle) {
          console.log('🗑️ Removing contaminated demo bundle from real profile:', bundle.name);
        }
        
        return !isDemoBundle;
      });
      
      await this.setItem(STORAGE_KEYS.ROUTINE_BUNDLES, cleanBundles);
      console.log(`🧹 Cleaned up bundles: ${bundles.length - cleanBundles.length} demo bundles removed`);
    }
    
    // Similarly clean routines if needed
    const routines = await this.getItem<WorkoutRoutine[]>(STORAGE_KEYS.ROUTINES);
    if (routines && routines.length > 0) {
      const cleanRoutines = routines.filter(routine => {
        const isDemoRoutine = routine.id.includes('demo-') || 
                             routine.name.includes('Emma') ||
                             routine.name.includes('Tanmay') ||
                             routine.name.includes('Alex') ||
                             routine.name.includes('Maya');
        
        if (isDemoRoutine) {
          console.log('🗑️ Removing contaminated demo routine from real profile:', routine.name);
        }
        
        return !isDemoRoutine;
      });
      
      await this.setItem(STORAGE_KEYS.ROUTINES, cleanRoutines);
      console.log(`🧹 Cleaned up routines: ${routines.length - cleanRoutines.length} demo routines removed`);
    }
    
    console.log('✅ Real profile data cleanup completed');
  }

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
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot save user profile in demo mode');
      return; // Don't save to storage in demo mode
    }
    return this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  async getUserProfile(): Promise<UserProfile | null> {
    if (this.isInDemoMode() && this.currentDemoProfile) {
      return this.currentDemoProfile.demographics;
    }
    return this.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  }

  // Workout methods
  async saveWorkout(workout: Workout): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('💾 StorageService - Saving workout to demo profile as user addition');
      // In demo mode, save as user addition on top of demo data
      if (this.currentDemoProfile) {
        const profileId = this.currentDemoProfile.id;
        if (!this.userAdditions[profileId]) {
          this.userAdditions[profileId] = [];
        }
        this.userAdditions[profileId].push(workout);
        console.log(`💾 Added user workout to ${this.currentDemoProfile.name}. User additions: ${this.userAdditions[profileId].length}`);
      }
      return; // Don't save to persistent storage, just add to user additions
    }
    const workouts = await this.getAllWorkouts();
    const updatedWorkouts = [...workouts, workout];
    return this.setItem(STORAGE_KEYS.WORKOUTS, updatedWorkouts);
  }

  async getAllWorkouts(): Promise<Workout[]> {
    if (this.isInDemoMode() && this.currentDemoProfile) {
      const profileId = this.currentDemoProfile.id;
      const originalWorkouts = this.currentDemoProfile.workoutHistory;
      const userWorkouts = this.userAdditions[profileId] || [];
      const allWorkouts = [...originalWorkouts, ...userWorkouts];
      console.log(`📋 Returning workouts for ${this.currentDemoProfile.name}: ${originalWorkouts.length} original + ${userWorkouts.length} user additions = ${allWorkouts.length} total`);
      return allWorkouts;
    }
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
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot delete workout in demo mode');
      return; // Don't modify storage in demo mode
    }
    const workouts = await this.getAllWorkouts();
    const filteredWorkouts = workouts.filter(w => w.id !== workoutId);
    return this.setItem(STORAGE_KEYS.WORKOUTS, filteredWorkouts);
  }

  // Nutrition methods
  async saveDailyNutrition(nutrition: DailyNutrition): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot save nutrition in demo mode');
      return; // Don't save to storage in demo mode
    }
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
    if (this.isInDemoMode() && this.currentDemoProfile) {
      // Demo profiles might have nutrition data in the future
      return []; // For now, return empty array for demo mode
    }
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
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot save exercises in demo mode');
      return; // Don't save to storage in demo mode
    }
    // Invalidate cache when exercises are bulk updated
    this.invalidateExerciseCache();
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

  // Sprint 2.2: Custom Exercise Management with race condition protection
  async saveExercise(exercise: Exercise): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot save exercise in demo mode');
      return; // Don't save to storage in demo mode
    }
    // Queue this save operation to prevent race conditions
    this.exerciseSaveQueue = this.exerciseSaveQueue.then(async () => {
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
        
        // Invalidate cache when exercises are modified
        this.invalidateExerciseCache();
        
        return this.setItem(STORAGE_KEYS.EXERCISES, exercises);
      } catch (error) {
        console.error('❌ ExerciseManager - Error saving exercise:', error);
        throw error;
      }
    });
    
    return this.exerciseSaveQueue;
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot delete exercise in demo mode');
      return; // Don't modify storage in demo mode
    }
    // Queue this delete operation to prevent race conditions
    this.exerciseSaveQueue = this.exerciseSaveQueue.then(async () => {
      try {
        if (__DEV__) console.log('🗑️ ExerciseManager - Deleting exercise:', exerciseId);
        const exercises = await this.getAllExercises();
        const filteredExercises = exercises.filter(e => e.id !== exerciseId);
        
        // Invalidate cache when exercises are modified
        this.invalidateExerciseCache();
        
        return this.setItem(STORAGE_KEYS.EXERCISES, filteredExercises);
      } catch (error) {
        console.error('❌ ExerciseManager - Error deleting exercise:', error);
        throw error;
      }
    });
    
    return this.exerciseSaveQueue;
  }

  async getCustomExercises(): Promise<Exercise[]> {
    try {
      // Return cached result if available
      if (this.customExercisesCache) return this.customExercisesCache;
      
      const allExercises = await this.getAllExercises();
      this.customExercisesCache = allExercises.filter(exercise => exercise.isCustom);
      return this.customExercisesCache;
    } catch (error) {
      console.error('❌ ExerciseManager - Error fetching custom exercises:', error);
      return [];
    }
  }

  async getDefaultExercises(): Promise<Exercise[]> {
    try {
      // Return cached result if available
      if (this.defaultExercisesCache) return this.defaultExercisesCache;
      
      const allExercises = await this.getAllExercises();
      this.defaultExercisesCache = allExercises.filter(exercise => !exercise.isCustom);
      return this.defaultExercisesCache;
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
      
      return allExercises.filter(({ name = '', category = '', muscleGroups = [], equipmentNeeded = [] }) => {
        const lowerName = name.toLowerCase();
        const lowerCategory = category.toLowerCase();
        return (
          lowerName.includes(searchTerm) ||
          lowerCategory.includes(searchTerm) ||
          muscleGroups.some(m => m?.toLowerCase()?.includes(searchTerm)) ||
          equipmentNeeded.some(eq => eq?.toLowerCase()?.includes(searchTerm))
        );
      });
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
      
      const wanted = equipment.map(e => e.toLowerCase());
      return allExercises.filter(({ equipmentNeeded = [] }) => {
        const current = equipmentNeeded.map(e => e.toLowerCase());
        return wanted.some(w => current.includes(w)) ||
               (wanted.includes('bodyweight') && current.length === 0);
      });
    } catch (error) {
      console.error('❌ ExerciseManager - Error filtering by equipment:', error);
      return [];
    }
  }

  async updateExerciseUsage(exerciseId: string): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot update exercise usage in demo mode');
      return; // Don't modify storage in demo mode
    }
    // Queue this update operation to prevent race conditions
    this.exerciseSaveQueue = this.exerciseSaveQueue.then(async () => {
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
          
          // Invalidate cache when exercises are modified
          this.invalidateExerciseCache();
          
          return this.setItem(STORAGE_KEYS.EXERCISES, exercises);
        } else {
          console.warn('⚠️ ExerciseManager - Exercise not found for usage update:', exerciseId);
        }
      } catch (error) {
        console.error('❌ ExerciseManager - Error updating exercise usage:', error);
        throw error; // Re-throw to allow caller to handle the error
      }
    });
    
    return this.exerciseSaveQueue;
  }

  // Routine methods
  async saveRoutine(routine: WorkoutRoutine): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot save routine in demo mode');
      return; // Don't save to storage in demo mode
    }
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
    if (this.isInDemoMode() && this.currentDemoProfile) {
      return this.currentDemoProfile.routines;
    }
    const routines = await this.getItem<WorkoutRoutine[]>(STORAGE_KEYS.ROUTINES);
    return routines || [];
  }

  async getRoutineById(routineId: string): Promise<WorkoutRoutine | null> {
    const routines = await this.getAllRoutines();
    return routines.find(r => r.id === routineId) || null;
  }

  async deleteRoutine(routineId: string): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot delete routine in demo mode');
      return; // Don't modify storage in demo mode
    }
    const routines = await this.getAllRoutines();
    const filteredRoutines = routines.filter(r => r.id !== routineId);
    return this.setItem(STORAGE_KEYS.ROUTINES, filteredRoutines);
  }

  // Routine Bundle methods
  async saveRoutineBundle(bundle: RoutineBundle): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot save routine bundle in demo mode');
      return; // Don't save to storage in demo mode
    }
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
          if (this.isInDemoMode() && this.currentDemoProfile) {
      return this.currentDemoProfile.bundles;
      }
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
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot set default routine bundle in demo mode');
      return; // Don't modify storage in demo mode
    }
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
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot delete routine bundle in demo mode');
      return; // Don't modify storage in demo mode
    }
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
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot save chat message in demo mode');
      return; // Don't save to storage in demo mode
    }
    const chatHistory = await this.getChatHistory();
    const updatedHistory = [...chatHistory, message];
    return this.setItem(STORAGE_KEYS.CHAT_HISTORY, updatedHistory);
  }

  async getChatHistory(): Promise<ChatMessage[]> {
    if (this.isInDemoMode() && this.currentDemoProfile) {
      // Demo profiles might have chat history in the future
      return []; // For now, return empty array for demo mode
    }
    const chatHistory = await this.getItem<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY);
    return chatHistory || [];
  }

  async clearChatHistory(): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot clear chat history in demo mode');
      return; // Don't modify storage in demo mode
    }
    return this.setItem(STORAGE_KEYS.CHAT_HISTORY, []);
  }

  // Progress methods
  async saveProgressRecord(record: ProgressRecord): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot save progress record in demo mode');
      return; // Don't save to storage in demo mode
    }
    const progress = await this.getAllProgress();
    const updatedProgress = [...progress, record];
    return this.setItem(STORAGE_KEYS.PROGRESS, updatedProgress);
  }

  async getAllProgress(): Promise<ProgressRecord[]> {
    if (this.isInDemoMode() && this.currentDemoProfile) {
      // Demo profiles might have progress data in the future
      return []; // For now, return empty array for demo mode
    }
    const progress = await this.getItem<ProgressRecord[]>(STORAGE_KEYS.PROGRESS);
    return progress || [];
  }

  async getProgressByExercise(exerciseId: string): Promise<ProgressRecord[]> {
    const allProgress = await this.getAllProgress();
    return allProgress.filter(p => p.exerciseId === exerciseId);
  }

  async clearAllProgress(): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot clear progress in demo mode');
      return; // Don't modify storage in demo mode
    }
    return this.setItem(STORAGE_KEYS.PROGRESS, []);
  }

  async clearAllWorkouts(): Promise<void> {
    if (this.isInDemoMode() && this.currentDemoProfile) {
      // In demo mode, only clear user additions, preserve original demo data
      const profileId = this.currentDemoProfile.id;
      this.userAdditions[profileId] = [];
      console.log(`🗑️ Cleared user additions for demo profile: ${this.currentDemoProfile.name}. Original demo data preserved.`);
      return;
    }
    return this.setItem(STORAGE_KEYS.WORKOUTS, []);
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot clear all data in demo mode');
      return; // Don't modify storage in demo mode
    }
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
    if (this.isInDemoMode()) {
      console.log('⚠️ StorageService - Cannot import data in demo mode');
      return; // Don't modify storage in demo mode
    }
    try {
      const data = JSON.parse(jsonData);
      
      // Use proper save methods that respect validation
      if (data.userProfile) await this.saveUserProfile(data.userProfile);
      if (data.workouts) await this.setItem(STORAGE_KEYS.WORKOUTS, data.workouts);
      if (data.nutrition) await this.setItem(STORAGE_KEYS.NUTRITION, data.nutrition);
      if (data.exercises) await this.saveExercises(data.exercises);
      if (data.routines) await this.setItem(STORAGE_KEYS.ROUTINES, data.routines);
      if (data.routineBundles) await this.setItem(STORAGE_KEYS.ROUTINE_BUNDLES, data.routineBundles);
      if (data.chatHistory) await this.setItem(STORAGE_KEYS.CHAT_HISTORY, data.chatHistory);
      if (data.progress) await this.setItem(STORAGE_KEYS.PROGRESS, data.progress);
      
      // Clean caches after import
      this.invalidateExerciseCache();
      console.log('✅ Data import completed successfully');
    } catch (error) {
      console.error('❌ Error importing data:', error);
      throw error;
    }
  }

  // Active Workout Session Management
  async saveActiveWorkoutSession(session: ActiveWorkoutSession): Promise<void> {
    console.log('💾 Saving active workout session:', session.routine.name, 'Ex:', session.currentExerciseIndex + 1, 'Sets:', session.currentSets.length);
    session.lastActivity = new Date().toISOString();
    session.profileId = this.currentMode.type === 'demo' ? this.currentMode.profileId : 'real-user';
    await this.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, session);
  }

  async getActiveWorkoutSession(): Promise<ActiveWorkoutSession | null> {
    const session = await this.getItem<ActiveWorkoutSession>(STORAGE_KEYS.ACTIVE_WORKOUT);
    if (!session) return null;

    // Check if session belongs to current profile
    const currentProfileId = this.currentMode.type === 'demo' ? this.currentMode.profileId : 'real-user';
    if (session.profileId !== currentProfileId) {
      console.log('⚠️ Active workout session belongs to different profile, clearing it');
      await this.clearActiveWorkoutSession();
      return null;
    }

    // Check if session is stale (older than 24 hours)
    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceActivity > 24) {
      console.log('⚠️ Active workout session is stale (>24h), clearing it');
      await this.clearActiveWorkoutSession();
      return null;
    }

    console.log('✅ Found valid active workout session:', session.routine.name);
    return session;
  }

  async clearActiveWorkoutSession(): Promise<void> {
    console.log('🧹 Clearing active workout session');
    await this.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  }

  async updateActiveWorkoutSession(updates: Partial<ActiveWorkoutSession>): Promise<void> {
    const session = await this.getActiveWorkoutSession();
    if (!session) {
      console.log('⚠️ No active session to update');
      return;
    }

    const updatedSession = {
      ...session,
      ...updates,
      lastActivity: new Date().toISOString(),
    };

    await this.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, updatedSession);
  }

  // Clean up stale active workout sessions (call this on app startup)
  async cleanupStaleActiveWorkouts(): Promise<void> {
    const session = await this.getItem<ActiveWorkoutSession>(STORAGE_KEYS.ACTIVE_WORKOUT);
    if (!session) return;

    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceActivity > 24) {
      console.log('🧹 Cleaning up stale active workout session');
      await this.clearActiveWorkoutSession();
    }
  }
}

// Export a singleton instance
export const storageService = new StorageService();

// Expose cleanup method for manual use if needed
export const cleanupContaminatedData = () => storageService.cleanupRealProfileData();

export default storageService; 