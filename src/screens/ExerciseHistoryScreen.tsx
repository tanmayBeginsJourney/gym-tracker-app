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

import { RootStackParamList, Workout, WorkoutSet } from '../types';
import { storageService } from '../services/storage';

type ExerciseHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExerciseHistory'>;
type ExerciseHistoryScreenRouteProp = RouteProp<RootStackParamList, 'ExerciseHistory'>;

interface Props {
  navigation: ExerciseHistoryScreenNavigationProp;
  route: ExerciseHistoryScreenRouteProp;
}

interface ExerciseSet {
  date: Date;
  workoutName: string;
  set: WorkoutSet;
  workoutDuration: number;
  mood?: number;
  energyLevel?: number;
}

interface DayGroup {
  date: string;
  workoutName: string;
  workoutDuration: number;
  sets: WorkoutSet[];
  totalVolume: number;
}

const ExerciseHistoryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { exerciseName } = route.params;
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([]);
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSets: 0,
    totalVolume: 0,
    maxWeight: 0,
    avgWeight: 0,
    totalWorkouts: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      loadExerciseHistory();
    }, [exerciseName])
  );

  const loadExerciseHistory = async () => {
    try {
      setLoading(true);
      
      // Ensure storage service is properly initialized with current mode
      await storageService.getCurrentMode();
      
      const allWorkouts = await storageService.getAllWorkouts();
      
      // Filter and extract sets for this specific exercise
      const exerciseData: ExerciseSet[] = [];
      
      allWorkouts.forEach((workout) => {
        const matchingExercises = workout.exercises.filter(
          ex => ex.exerciseName === exerciseName
        );
        
        matchingExercises.forEach((exercise) => {
          exercise.sets.forEach((set) => {
            if (set.completed) {
              exerciseData.push({
                date: workout.date,
                workoutName: workout.routineName || 'Custom Workout',
                set: set,
                workoutDuration: workout.duration,
                mood: workout.mood,
                energyLevel: workout.energyLevel,
              });
            }
          });
        });
      });

      // Sort by date (newest first)
      exerciseData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setExerciseSets(exerciseData);

      // Group sets by day
      const groupedByDay: { [key: string]: DayGroup } = {};
      
      exerciseData.forEach((item) => {
        const dateKey = new Date(item.date).toDateString();
        
        if (!groupedByDay[dateKey]) {
          groupedByDay[dateKey] = {
            date: dateKey,
            workoutName: item.workoutName,
            workoutDuration: item.workoutDuration,
            sets: [],
            totalVolume: 0,
          };
        }
        
        groupedByDay[dateKey].sets.push(item.set);
        groupedByDay[dateKey].totalVolume += item.set.weight * item.set.reps;
      });

      // Convert to array and sort by date (newest first)
      const dayGroupsArray = Object.values(groupedByDay).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setDayGroups(dayGroupsArray);
      
      // Calculate stats
      if (exerciseData.length > 0) {
        const totalSets = exerciseData.length;
        const totalVolume = exerciseData.reduce((sum, item) => sum + (item.set.weight * item.set.reps), 0);
        const maxWeight = Math.max(...exerciseData.map(item => item.set.weight));
        const avgWeight = exerciseData.reduce((sum, item) => sum + item.set.weight, 0) / totalSets;
        const uniqueWorkouts = new Set(exerciseData.map(item => `${item.date}-${item.workoutName}`)).size;
        
        setStats({
          totalSets,
          totalVolume: Math.round(totalVolume),
          maxWeight,
          avgWeight: Math.round(avgWeight * 10) / 10,
          totalWorkouts: uniqueWorkouts,
        });
      }
    } catch (error) {
      console.error('❌ ExerciseHistoryScreen - Error loading exercise history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodEmoji = (mood: number) => {
    const moodMap: { [key: number]: string } = {
      1: '😩', 2: '😔', 3: '😐', 4: '😊', 5: '🔥'
    };
    return moodMap[mood] || '😐';
  };

  const getEnergyEmoji = (energy: number) => {
    const energyMap: { [key: number]: string } = {
      1: '🪫', 2: '🔋', 3: '🔋🔋', 4: '🔋🔋🔋', 5: '⚡'
    };
    return energyMap[energy] || '🔋';
  };

  const formatRestTime = (restTime: number) => {
    const minutes = Math.floor(restTime / 60);
    const seconds = Math.floor(restTime % 60); // Remove decimals by using Math.floor
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
          <Text style={styles.headerTitle} numberOfLines={1}>{exerciseName}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3182ce" />
          <Text style={styles.loadingText}>Loading exercise history...</Text>
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
        <Text style={styles.headerTitle} numberOfLines={1}>{exerciseName}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>📊 {exerciseName} Statistics</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="fitness" size={24} color="#10b981" />
              <Text style={styles.statValue}>{stats.maxWeight}</Text>
              <Text style={styles.statLabel}>Max Weight (kg)</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={24} color="#3182ce" />
              <Text style={styles.statValue}>{stats.avgWeight}</Text>
              <Text style={styles.statLabel}>Avg Weight (kg)</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="layers" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{stats.totalSets}</Text>
              <Text style={styles.statLabel}>Total Sets</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="barbell" size={24} color="#ef4444" />
              <Text style={styles.statValue}>{stats.totalVolume}</Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
          </View>
          
          <View style={styles.workoutCountContainer}>
            <Text style={styles.workoutCountText}>
              📅 Performed in {stats.totalWorkouts} workout{stats.totalWorkouts !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Sets History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Complete Set History</Text>
          
                    {dayGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>No Sets Found</Text>
              <Text style={styles.emptyText}>
                No completed sets found for {exerciseName}. Start a workout to see your progress here!
              </Text>
            </View>
          ) : (
            dayGroups.map((dayGroup, dayIndex) => (
              <View key={dayIndex} style={styles.dayCard}>
                {/* Day Header */}
                <View style={styles.dayHeader}>
                  <View style={styles.dayDateContainer}>
                    <Text style={styles.dayDate}>{formatDate(new Date(dayGroup.date))}</Text>
                    <Text style={styles.dayWorkoutName}>{dayGroup.workoutName}</Text>
                  </View>
                  <View style={styles.dayStatsContainer}>
                    <Text style={styles.dayDuration}>{dayGroup.workoutDuration} min</Text>
                    <Text style={styles.dayVolume}>{Math.round(dayGroup.totalVolume)}kg total</Text>
                  </View>
                </View>

                {/* Sets for this day */}
                <View style={styles.setsContainer}>
                  <View style={styles.setsHeader}>
                    <Text style={styles.setsHeaderText}>Set</Text>
                    <Text style={styles.setsHeaderText}>Weight</Text>
                    <Text style={styles.setsHeaderText}>Reps</Text>
                    <Text style={styles.setsHeaderText}>Rest</Text>
                  </View>
                  
                  {dayGroup.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setRow}>
                      <View style={styles.setNumber}>
                        <Text style={styles.setNumberText}>{set.setNumber}</Text>
                      </View>
                      <View style={styles.setWeight}>
                        <Text style={styles.setValueText}>
                          {set.weight > 0 ? `${set.weight}kg` : 'BW'}
                        </Text>
                      </View>
                      <View style={styles.setReps}>
                        <Text style={styles.setValueText}>{set.reps}</Text>
                      </View>
                      <View style={styles.setRest}>
                        <Text style={styles.setRestText}>
                          {set.restTime ? formatRestTime(set.restTime) : '--'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
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
  statsCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsHeader: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  workoutCountContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  workoutCountText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
  },
  historySection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  setCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setDateContainer: {
    flex: 1,
  },
  setDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  setTime: {
    fontSize: 14,
    color: '#718096',
  },
  setWorkoutInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  setWorkoutName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3182ce',
  },
  setWorkoutDuration: {
    fontSize: 12,
    color: '#718096',
  },
  moodEnergyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
  },
  moodEnergyItem: {
    alignItems: 'center',
  },
  moodEnergyLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  moodEnergyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },
  setDetailsContainer: {
    marginBottom: 12,
  },
  setDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  setDetailsHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    flex: 1,
    textAlign: 'center',
  },
  setDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setNumber: {
    flex: 1,
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },
  setWeight: {
    flex: 1,
    alignItems: 'center',
  },
  setReps: {
    flex: 1,
    alignItems: 'center',
  },
  setRest: {
    flex: 1,
    alignItems: 'center',
  },
  setValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },
  setRestText: {
    fontSize: 14,
    color: '#718096',
  },
  setNotesContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  setNotesText: {
    fontSize: 14,
    color: '#2d3748',
    fontStyle: 'italic',
  },
  setVolumeContainer: {
    alignItems: 'center',
  },
  setVolumeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
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
  // New styles for day grouping
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dayDateContainer: {
    flex: 1,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 2,
  },
  dayWorkoutName: {
    fontSize: 14,
    color: '#3182ce',
    fontWeight: '600',
  },
  dayStatsContainer: {
    alignItems: 'flex-end',
  },
  dayDuration: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 2,
  },
  dayVolume: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  setsContainer: {
    marginTop: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  setsHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
});

export default ExerciseHistoryScreen; 