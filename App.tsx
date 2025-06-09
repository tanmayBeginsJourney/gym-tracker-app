import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RoutineBuilderScreen from './src/screens/RoutineBuilderScreen';
import BundleManagerScreen from './src/screens/BundleManagerScreen';
import ExerciseManagerScreen from './src/screens/ExerciseManagerScreen';
import ProfileSelectionScreen from './src/screens/ProfileSelectionScreen';
import WorkoutHistoryScreen from './src/screens/WorkoutHistoryScreen';
import AllExercisesScreen from './src/screens/AllExercisesScreen';
import ExerciseHistoryScreen from './src/screens/ExerciseHistoryScreen';

// Import services
import { storageService } from './src/services/storage';
import { defaultExercises, defaultRoutines } from './src/data/exercises';

import type { RootStackParamList, StorageMode } from './src/types';
import { AppState } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  console.log('🚀 App.tsx - Application starting...');
  
  const [appState, setAppState] = useState<AppState>(AppState.ProfileSelection);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    console.log('🚀 App.tsx - useEffect triggered, initializing app...');
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 App.tsx - useEffect triggered, initializing app...');
      
      // Cleanup stale active workout sessions
      await storageService.cleanupStaleActiveWorkouts();
      
      // Load saved mode first
      const savedMode = await storageService.getSavedStorageMode();
      if (savedMode) {
        console.log('🔄 App.tsx - Restored saved mode:', savedMode);
        await storageService.switchToProfile(savedMode);
        setAppState(savedMode.type === 'demo' ? AppState.DemoMode : AppState.RealMode);
      } else {
        console.log('📱 App.tsx - No saved mode, showing profile selection');
        setAppState(AppState.ProfileSelection);
      }
      
      // Smart exercise database migration - preserve custom exercises
      const existingExercises = await storageService.getAllExercises();
      
      if (existingExercises.length === 0) {
        // First time setup - load all default exercises
        console.log(`🚀 App.tsx - Initial setup: Loading ${defaultExercises.length} default exercises`);
        await storageService.saveExercises(defaultExercises);
        console.log('✅ Initial exercise database loaded');
      } else {
        // Check for missing default exercises by ID comparison
        const existingIds = new Set(existingExercises.map(ex => ex.id));
        const missingDefaults = defaultExercises.filter(ex => !existingIds.has(ex.id));
        
        if (missingDefaults.length > 0) {
          console.log(`🚀 App.tsx - Adding ${missingDefaults.length} missing default exercises (preserving ${existingExercises.length} existing)`);
          
          // Add only missing default exercises without overwriting existing ones
          for (const missingExercise of missingDefaults) {
            await storageService.saveExercise(missingExercise);
          }
          
          console.log(`✅ Exercise database updated: ${missingDefaults.length} new defaults added`);
        } else {
          console.log(`✅ Exercise database current: ${existingExercises.length} exercises (${existingExercises.filter(ex => ex.isCustom).length} custom)`);
        }
      }

      // Check if routines are already loaded
      const existingRoutines = await storageService.getAllRoutines();
      console.log(`🚀 App.tsx - Found ${existingRoutines.length} existing routines`);
      
      if (existingRoutines.length === 0) {
        // Load default routines
        for (const routine of defaultRoutines) {
          await storageService.saveRoutine(routine);
        }
        console.log('✅ Default routines loaded');
      }

      // Only create default profile if we're in real mode and no profile exists
      if (!storageService.isInDemoMode()) {
      const existingProfile = await storageService.getUserProfile();
      console.log('🚀 App.tsx - Existing profile:', existingProfile ? 'Found' : 'Not found');
      
      if (!existingProfile) {
        console.log('🚀 App.tsx - Creating default user profile...');
        const defaultProfile = {
          id: 'user-default',
          name: 'Fitness Enthusiast',
          age: 25,
          weight: 70,
          height: 175,
          gender: 'other' as const,
            experienceLevel: 'intermediate' as const,
          goals: ['strength', 'muscle'] as Array<'strength' | 'muscle' | 'endurance' | 'weight_loss'>,
          createdAt: new Date(),
          personalDetails: {
            targetPhysique: 'lean_muscle' as const,
            specificGoals: ['Build strength', 'Improve consistency', 'Feel more confident'],
            weakBodyParts: ['chest', 'shoulders'] as Array<'legs' | 'back' | 'chest' | 'shoulders' | 'arms' | 'core' | 'forearms'>,
            priorityMuscles: ['chest', 'shoulders', 'legs'],
            preferredWorkoutStyle: 'mixed' as const,
            workoutFrequency: 3,
            sessionDuration: 45,
            restDayPreferences: ['light stretching', 'walks'],
            injuries: [],
            allergies: [],
            dietaryRestrictions: [],
            motivationalFactors: ['feeling strong', 'looking good', 'health benefits'],
            personalChallenges: ['consistency', 'time management'],
            additionalNotes: 'New to fitness, excited to start this journey!'
          }
        };
        
        await storageService.saveUserProfile(defaultProfile);
        console.log('✅ Default user profile created');
        }
      }

      setIsInitialized(true);
      console.log('🚀 App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      setIsInitialized(true); // Still allow app to continue
    }
  };

  const handleProfileSelected = async (mode: StorageMode) => {
    console.log('🎯 App.tsx - Profile selected:', mode);
    
    try {
      await storageService.switchToProfile(mode);
      
      if (mode.type === 'demo') {
        setAppState(AppState.DemoMode);
      } else {
        setAppState(AppState.RealMode);
      }
      
      console.log('✅ App.tsx - Successfully switched to profile mode:', mode.type);
    } catch (error) {
      console.error('❌ App.tsx - Error switching profile:', error);
    }
  };

  // Show profile selection if not initialized or in ProfileSelection state
  if (!isInitialized || appState === AppState.ProfileSelection) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {isInitialized ? (
          <ProfileSelectionScreen onProfileSelected={handleProfileSelected} />
        ) : (
          // You could add a loading screen here
          <></>
        )}
      </SafeAreaProvider>
    );
  }

  // Main app navigation for both demo and real modes
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false, // Hide headers since we're using sidebar navigation
          }}
          initialRouteName="Home"
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
          />
          <Stack.Screen 
            name="Workout" 
            component={WorkoutScreen}
          />
          <Stack.Screen 
            name="Progress" 
            component={ProgressScreen}
          />
          <Stack.Screen 
            name="Nutrition" 
            component={NutritionScreen}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
          />
          <Stack.Screen 
            name="RoutineBuilder" 
            component={RoutineBuilderScreen}
            options={{ 
              headerShown: true,
              title: 'Create Routine',
              headerStyle: { backgroundColor: '#1a365d' },
              headerTintColor: '#ffffff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen 
            name="BundleManager" 
            component={BundleManagerScreen}
            options={{ 
              headerShown: true,
              title: 'Workout Schedule',
              headerStyle: { backgroundColor: '#1a365d' },
              headerTintColor: '#ffffff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen 
            name="ExerciseManager" 
            component={ExerciseManagerScreen}
            options={{ 
              headerShown: true,
              title: 'Exercise Manager',
              headerStyle: { backgroundColor: '#1a365d' },
              headerTintColor: '#ffffff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen 
            name="WorkoutHistory" 
            component={WorkoutHistoryScreen}
          />
          <Stack.Screen 
            name="AllExercises" 
            component={AllExercisesScreen}
          />
          <Stack.Screen 
            name="ExerciseHistory" 
            component={ExerciseHistoryScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
