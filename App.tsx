import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Import screens (we'll create these next)
import HomeScreen from './src/screens/HomeScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import ChatScreen from './src/screens/ChatScreen';

// Import services
import { storageService } from './src/services/storage';
import { defaultExercises, defaultRoutines } from './src/data/exercises';

import type { RootStackParamList } from './src/types';

const Tab = createBottomTabNavigator<RootStackParamList>();

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
            component={WorkoutScreen} 
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
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
