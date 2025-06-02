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
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyWorkouts = workouts.filter(workout => 
      new Date(workout.date) >= oneWeekAgo
    );
    
    const totalVolume = weeklyWorkouts.reduce((total, workout) => {
      const workoutVolume = workout.exercises.reduce((exerciseTotal, exercise) => {
        const setVolume = exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.weight * set.reps);
        }, 0);
        return exerciseTotal + setVolume;
      }, 0);
      return total + workoutVolume;
    }, 0);
    
    const totalDuration = weeklyWorkouts.reduce((total, workout) => {
      return total + (workout.duration || 0);
    }, 0);
    
    if (__DEV__) {
      console.log(`📊 Weekly stats: ${weeklyWorkouts.length} workouts, ${totalVolume}kg volume, ${totalDuration}min duration`);
    }
    
    return {
      workoutCount: weeklyWorkouts.length,
      totalVolume,
      averageVolume: weeklyWorkouts.length > 0 ? totalVolume / weeklyWorkouts.length : 0,
      totalDuration,
      averageDuration: weeklyWorkouts.length > 0 ? totalDuration / weeklyWorkouts.length : 0,
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