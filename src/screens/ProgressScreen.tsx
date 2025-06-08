import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '../services/storage';
import SidebarNav from '../components/SidebarNav';
import type { Workout } from '../types';

const { width } = Dimensions.get('window');

const ProgressScreen: React.FC = () => {
  console.log('📊 ProgressScreen - Component mounted');
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('📊 ProgressScreen - useEffect triggered, loading data...');
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      console.log('📊 ProgressScreen - Starting data load...');
      setLoading(true);
      const allWorkouts = await storageService.getAllWorkouts();
      console.log(`📊 ProgressScreen - Loaded ${allWorkouts.length} workouts`);
      setWorkouts(allWorkouts);
    } catch (error) {
      console.error('❌ ProgressScreen - Error loading data:', error);
    } finally {
      setLoading(false);
      console.log('📊 ProgressScreen - Data loading completed');
    }
  };

  const getWeeklyStats = (workouts: Workout[]) => {
    // Input validation
    if (!Array.isArray(workouts) || workouts.length === 0) {
      if (__DEV__) console.log('📊 getWeeklyStats - No workouts provided, returning empty stats');
      return {
        workoutCount: 0,
        totalVolume: 0,
        averageVolume: 0,
        totalDuration: 0,
        averageDuration: 0,
      };
    }
    
    // Create timezone-aware date for consistent calculation
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const weeklyWorkouts = workouts.filter(workout => {
      // Robust date parsing with fallback
      const workoutDate = workout.date instanceof Date ? workout.date : new Date(workout.date);
      
      // Validate date parsing
      if (isNaN(workoutDate.getTime())) {
        if (__DEV__) console.warn('📊 getWeeklyStats - Invalid workout date:', workout.date);
        return false;
      }
      
      return workoutDate >= oneWeekAgo;
    });
    
    const totalVolume = weeklyWorkouts.reduce((total, workout) => {
      // Validate workout structure
      if (!workout.exercises || !Array.isArray(workout.exercises)) {
        if (__DEV__) console.warn('📊 getWeeklyStats - Invalid workout exercises:', workout);
        return total;
      }
      
      const workoutVolume = workout.exercises.reduce((exerciseTotal, exercise) => {
        // Validate exercise structure
        if (!exercise.sets || !Array.isArray(exercise.sets)) {
          if (__DEV__) console.warn('📊 getWeeklyStats - Invalid exercise sets:', exercise);
          return exerciseTotal;
        }
        
        const setVolume = exercise.sets.reduce((setTotal, set) => {
          // Validate set data with fallbacks
          const weight = typeof set.weight === 'number' && !isNaN(set.weight) ? set.weight : 0;
          const reps = typeof set.reps === 'number' && !isNaN(set.reps) ? set.reps : 0;
          return setTotal + (weight * reps);
        }, 0);
        return exerciseTotal + setVolume;
      }, 0);
      return total + workoutVolume;
    }, 0);
    
    const totalDuration = weeklyWorkouts.reduce((total, workout) => {
      const duration = typeof workout.duration === 'number' && !isNaN(workout.duration) ? workout.duration : 0;
      return total + duration;
    }, 0);
    
    if (__DEV__) {
      console.log(`📊 Weekly stats: ${weeklyWorkouts.length} workouts, ${totalVolume.toFixed(1)}kg volume, ${totalDuration}min duration`);
    }
    
    return {
      workoutCount: weeklyWorkouts.length,
      totalVolume: Math.round(totalVolume * 10) / 10, // Round to 1 decimal place
      averageVolume: weeklyWorkouts.length > 0 ? Math.round((totalVolume / weeklyWorkouts.length) * 10) / 10 : 0,
      totalDuration,
      averageDuration: weeklyWorkouts.length > 0 ? Math.round(totalDuration / weeklyWorkouts.length) : 0,
    };
  };

  return (
    <View style={styles.container}>
      <SidebarNav currentRoute="Progress" />
      <View style={styles.content}>
        <Text style={styles.title}>Progress Screen</Text>
        <Text style={styles.subtitle}>Track your gains! 📈</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
  },
});

export default ProgressScreen; 