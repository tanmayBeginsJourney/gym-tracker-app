import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Import screens (we'll create these next)
import HomeScreen from './src/screens/HomeScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RoutineBuilderScreen from './src/screens/RoutineBuilderScreen';
import BundleManagerScreen from './src/screens/BundleManagerScreen';

// Import services
import { storageService } from './src/services/storage';
import { defaultExercises, defaultRoutines } from './src/data/exercises';

import type { RootStackParamList } from './src/types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

// Workout Stack Navigator
function WorkoutStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a365d',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="WorkoutMain" 
        component={WorkoutScreen} 
        options={{ title: 'Workout', headerShown: false }}
      />
      <Stack.Screen 
        name="RoutineBuilder" 
        component={RoutineBuilderScreen} 
        options={{ title: 'Create Routine' }}
      />
      <Stack.Screen 
        name="BundleManager" 
        component={BundleManagerScreen} 
        options={{ title: 'Workout Schedule' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize app with default data
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if exercises are already loaded
      const existingExercises = await storageService.getAllExercises();
      if (existingExercises.length === 0) {
        // Load default exercises
        await storageService.saveExercises(defaultExercises);
        console.log('✅ Default exercises loaded');
      }

      // Check if routines are already loaded
      const existingRoutines = await storageService.getAllRoutines();
      if (existingRoutines.length === 0) {
        // Load default routines
        for (const routine of defaultRoutines) {
          await storageService.saveRoutine(routine);
        }
        console.log('✅ Default routines loaded');
      }

      // Check if user profile exists, create a basic one if not
      const existingProfile = await storageService.getUserProfile();
      if (!existingProfile) {
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
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Workout') {
                iconName = focused ? 'fitness' : 'fitness-outline';
              } else if (route.name === 'Progress') {
                iconName = focused ? 'trending-up' : 'trending-up-outline';
              } else if (route.name === 'Nutrition') {
                iconName = focused ? 'restaurant' : 'restaurant-outline';
              } else if (route.name === 'Chat') {
                iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              } else {
                iconName = 'ellipse-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#3182ce',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e2e8f0',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            headerStyle: {
              backgroundColor: '#1a365d',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Dashboard' }}
          />
          <Tab.Screen 
            name="Workout" 
            component={WorkoutStackNavigator} 
            options={{ title: 'Workout' }}
          />
          <Tab.Screen 
            name="Progress" 
            component={ProgressScreen} 
            options={{ title: 'Progress' }}
          />
          <Tab.Screen 
            name="Nutrition" 
            component={NutritionScreen} 
            options={{ title: 'Nutrition' }}
          />
          <Tab.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ title: 'AI Coach' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ title: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
