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