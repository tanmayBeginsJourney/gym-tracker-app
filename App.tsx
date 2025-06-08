import React, { useEffect } from 'react';
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

// Import services
import { storageService } from './src/services/storage';
import { defaultExercises, defaultRoutines } from './src/data/exercises';

import type { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  console.log('🚀 App.tsx - Application starting...');
  
  useEffect(() => {
    console.log('🚀 App.tsx - useEffect triggered, initializing app...');
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 App.tsx - Starting app initialization...');
      
      // Force update to load expanded exercise database
      console.log(`🚀 App.tsx - Loading expanded exercise database with ${defaultExercises.length} exercises`);
      await storageService.saveExercises(defaultExercises);
      console.log('✅ Expanded exercise database loaded');

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

      // Check if user profile exists, create a basic one if not
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
          experienceLevel: 'beginner' as const,
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

      console.log('🚀 App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    }
  };

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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
