import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList, Workout, PersonalRecord } from '../types';
import { storageService } from '../services/storage';

type AllExercisesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AllExercises'>;
type AllExercisesScreenRouteProp = RouteProp<RootStackParamList, 'AllExercises'>;

interface Props {
  navigation: AllExercisesScreenNavigationProp;
  route: AllExercisesScreenRouteProp;
}

const AllExercisesScreen: React.FC<Props> = ({ navigation, route }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadExerciseData();
    }, [])
  );

  const loadExerciseData = async () => {
    try {
      setLoading(true);
      
      // Ensure storage service is properly initialized with current mode
      await storageService.getCurrentMode();
      
      const allWorkouts = await storageService.getAllWorkouts();
      setWorkouts(allWorkouts);
      
      if (allWorkouts.length > 0) {
        const records = calculatePersonalRecords(allWorkouts);
        setPersonalRecords(records.sort((a, b) => b.maxWeight - a.maxWeight));
      } else {
        setPersonalRecords([]);
      }
    } catch (error) {
      console.error('❌ AllExercisesScreen - Error loading exercise data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePersonalRecords = (workouts: Workout[]): PersonalRecord[] => {
    const exerciseRecords: { [key: string]: PersonalRecord } = {};

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (set.completed && set.weight > 0) {
            const key = exercise.exerciseName;
            
            if (!exerciseRecords[key] || set.weight > exerciseRecords[key].maxWeight) {
              exerciseRecords[key] = {
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName,
                maxWeight: set.weight,
                maxReps: set.reps,
                date: workout.date,
                isNewRecord: false,
              };
            }
          }
        });
      });
    });

    return Object.values(exerciseRecords);
  };

  const renderExerciseCard = (record: PersonalRecord, index: number) => {
    const exerciseWorkouts = workouts.filter(w => 
      w.exercises.some(ex => ex.exerciseName === record.exerciseName)
    );
    const totalSets = exerciseWorkouts.reduce((sum, w) => {
      return sum + w.exercises
        .filter(ex => ex.exerciseName === record.exerciseName)
        .reduce((exSum, ex) => exSum + ex.sets.length, 0);
    }, 0);
    const avgWeight = exerciseWorkouts.length > 0 ? 
      exerciseWorkouts.reduce((sum, w) => {
        const matchingExercises = w.exercises.filter(ex => ex.exerciseName === record.exerciseName);
        return sum + matchingExercises.reduce((exSum, ex) => {
          return exSum + ex.sets.reduce((setSum, set) => setSum + set.weight, 0) / ex.sets.length;
        }, 0) / matchingExercises.length;
      }, 0) / exerciseWorkouts.length : 0;

    return (
      <TouchableOpacity 
        key={`${record.exerciseId}-${index}`} 
        style={styles.exerciseCard}
        onPress={() => navigation.navigate('ExerciseHistory', { exerciseName: record.exerciseName })}
      >
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>{record.exerciseName}</Text>
          <Text style={styles.exerciseRank}>#{index + 1}</Text>
        </View>
        <View style={styles.exerciseStats}>
          <View style={styles.exerciseStat}>
            <Text style={styles.exerciseLabel}>PR</Text>
            <Text style={styles.exerciseValue}>{record.maxWeight}kg</Text>
          </View>
          <View style={styles.exerciseStat}>
            <Text style={styles.exerciseLabel}>Avg</Text>
            <Text style={styles.exerciseValue}>{Math.round(avgWeight)}kg</Text>
          </View>
          <View style={styles.exerciseStat}>
            <Text style={styles.exerciseLabel}>Sets</Text>
            <Text style={styles.exerciseValue}>{totalSets}</Text>
          </View>
        </View>
        <View style={styles.exerciseProgressBar}>
          <View 
            style={[
              styles.exerciseProgressFill,
              { 
                width: `${Math.min(100, (avgWeight / record.maxWeight) * 100)}%`,
                backgroundColor: '#3182ce'
              }
            ]} 
          />
        </View>
        <Text style={styles.exerciseFrequency}>
          {exerciseWorkouts.length} workouts • Last: {new Date(record.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Exercises</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3182ce" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Exercises</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Header */}
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>📊 Personal Records</Text>
          <Text style={styles.statsSubtitle}>
            {personalRecords.length} exercises • Sorted by highest weight
          </Text>
        </View>

        {/* Exercise Cards */}
        <View style={styles.exerciseGrid}>
          {personalRecords.map((record, index) => renderExerciseCard(record, index))}
        </View>

        {/* Empty State */}
        {personalRecords.length === 0 && (
          <View style={styles.emptyContainer}>
                          <Text style={styles.emptyEmoji}>🏋️</Text>
            <Text style={styles.emptyTitle}>No Personal Records</Text>
            <Text style={styles.emptyText}>
              Complete some workouts to see your personal records here!
            </Text>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#3182ce',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4a5568',
    marginTop: 16,
  },
  statsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  exerciseCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    flex: 1,
  },
  exerciseRank: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3182ce',
    backgroundColor: '#ebf8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseStat: {
    alignItems: 'center',
  },
  exerciseLabel: {
    fontSize: 10,
    color: '#a0aec0',
    marginBottom: 2,
  },
  exerciseValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  exerciseProgressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  exerciseProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  exerciseFrequency: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomPadding: {
    height: 40,
  },
});

export default AllExercisesScreen; 