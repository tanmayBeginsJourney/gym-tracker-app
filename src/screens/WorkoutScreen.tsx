import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutRoutine, Workout } from '../types';
import { storageService } from '../services/storage';
import { defaultRoutines } from '../data/exercises';
import ActiveWorkoutScreen from './ActiveWorkoutScreen';
import WorkoutCompletionScreen from './WorkoutCompletionScreen';

type WorkoutState = 'browse' | 'active' | 'complete';

const WorkoutScreen: React.FC = () => {
  const [workoutState, setWorkoutState] = useState<WorkoutState>('browse');
  const [availableRoutines, setAvailableRoutines] = useState<WorkoutRoutine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null);
  const [completedWorkout, setCompletedWorkout] = useState<Workout | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load routines
      let routines = await storageService.getAllRoutines();
      if (routines.length === 0) {
        // Initialize with default routines
        for (const routine of defaultRoutines) {
          await storageService.saveRoutine(routine);
        }
        routines = defaultRoutines;
      }
      setAvailableRoutines(routines);

      // Load recent workouts
      const allWorkouts = await storageService.getAllWorkouts();
      const recent = allWorkouts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      setRecentWorkouts(recent);

    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = (routine: WorkoutRoutine) => {
    setSelectedRoutine(routine);
    setWorkoutState('active');
  };

  const onWorkoutComplete = async (workout: Workout) => {
    try {
      // Save the workout
      await storageService.saveWorkout(workout);
      
      // Update state
      setCompletedWorkout(workout);
      setWorkoutState('complete');
      
      // Reload recent workouts
      await loadData();
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const onWorkoutCancel = () => {
    setSelectedRoutine(null);
    setWorkoutState('browse');
  };

  const onCompletionDismiss = () => {
    setCompletedWorkout(null);
    setWorkoutState('browse');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#38a169';
      case 'intermediate': return '#ff8c00';
      case 'advanced': return '#e53e3e';
      default: return '#4a5568';
    }
  };

  const getTodaysRoutine = (): WorkoutRoutine | null => {
    const dayOfWeek = new Date().getDay();
    
    if (dayOfWeek === 1 || dayOfWeek === 4) { // Monday or Thursday
      return availableRoutines.find(r => r.id === 'push-day') || null;
    } else if (dayOfWeek === 3 || dayOfWeek === 6) { // Wednesday or Saturday
      return availableRoutines.find(r => r.id === 'beginner-full-body') || null;
    }
    
    return null;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading workouts...</Text>
      </View>
    );
  }

  // Render active workout screen
  if (workoutState === 'active' && selectedRoutine) {
    return (
      <ActiveWorkoutScreen
        routine={selectedRoutine}
        onComplete={onWorkoutComplete}
        onCancel={onWorkoutCancel}
      />
    );
  }

  const todaysRoutine = getTodaysRoutine();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workouts</Text>
          <Text style={styles.headerSubtitle}>Choose your routine and start training</Text>
        </View>

        {/* Today's Recommended Workout */}
        {todaysRoutine && (
          <View style={styles.todaySection}>
            <Text style={styles.sectionTitle}>Today's Recommended Workout</Text>
            <TouchableOpacity 
              style={styles.todayCard}
              onPress={() => startWorkout(todaysRoutine)}
            >
              <View style={styles.todayHeader}>
                <Ionicons name="star" size={24} color="#ffd700" />
                <Text style={styles.todayLabel}>RECOMMENDED</Text>
              </View>
              <Text style={styles.todayName}>{todaysRoutine.name}</Text>
              <Text style={styles.todayDescription}>{todaysRoutine.description}</Text>
              <View style={styles.todayDetails}>
                <View style={styles.todayDetail}>
                  <Ionicons name="barbell" size={16} color="#4a5568" />
                  <Text style={styles.todayDetailText}>
                    {todaysRoutine.exercises.length} exercises
                  </Text>
                </View>
                <View style={styles.todayDetail}>
                  <Ionicons name="time" size={16} color="#4a5568" />
                  <Text style={styles.todayDetailText}>
                    ~{todaysRoutine.estimatedDuration} min
                  </Text>
                </View>
                <View style={styles.todayDetail}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(todaysRoutine.difficulty) }]}>
                    <Text style={styles.difficultyText}>{todaysRoutine.difficulty}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.startButton}>
                <Text style={styles.startButtonText}>Start Workout</Text>
                <Ionicons name="play" size={20} color="#ffffff" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* All Routines */}
        <View style={styles.routinesSection}>
          <Text style={styles.sectionTitle}>All Routines</Text>
          {availableRoutines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={styles.routineCard}
              onPress={() => startWorkout(routine)}
            >
              <View style={styles.routineHeader}>
                <Text style={styles.routineName}>{routine.name}</Text>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(routine.difficulty) }]}>
                  <Text style={styles.difficultyText}>{routine.difficulty}</Text>
                </View>
              </View>
              <Text style={styles.routineDescription}>{routine.description}</Text>
              <View style={styles.routineDetails}>
                <View style={styles.routineDetail}>
                  <Ionicons name="barbell" size={16} color="#4a5568" />
                  <Text style={styles.routineDetailText}>
                    {routine.exercises.length} exercises
                  </Text>
                </View>
                <View style={styles.routineDetail}>
                  <Ionicons name="time" size={16} color="#4a5568" />
                  <Text style={styles.routineDetailText}>
                    ~{routine.estimatedDuration} min
                  </Text>
                </View>
              </View>
              <View style={styles.muscleGroups}>
                {routine.muscleGroups.map((group, index) => (
                  <View key={index} style={styles.muscleGroup}>
                    <Text style={styles.muscleGroupText}>{group}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {recentWorkouts.map((workout) => (
              <View key={workout.id} style={styles.recentCard}>
                <View style={styles.recentHeader}>
                  <Text style={styles.recentName}>
                    {workout.routineName || 'Custom Workout'}
                  </Text>
                  <Text style={styles.recentDate}>
                    {formatDate(workout.date)}
                  </Text>
                </View>
                <View style={styles.recentDetails}>
                  <View style={styles.recentDetail}>
                    <Ionicons name="time" size={14} color="#4a5568" />
                    <Text style={styles.recentDetailText}>{workout.duration} min</Text>
                  </View>
                  <View style={styles.recentDetail}>
                    <Ionicons name="barbell" size={14} color="#4a5568" />
                    <Text style={styles.recentDetailText}>
                      {workout.exercises.length} exercises
                    </Text>
                  </View>
                  <View style={styles.recentDetail}>
                    <Ionicons name="fitness" size={14} color="#4a5568" />
                    <Text style={styles.recentDetailText}>
                      {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} sets
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Workout Completion Modal */}
      <Modal visible={workoutState === 'complete'} transparent>
        {completedWorkout && (
          <WorkoutCompletionScreen
            workout={completedWorkout}
            onDismiss={onCompletionDismiss}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#4a5568',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4a5568',
  },
  
  // Today's Section
  todaySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 16,
  },
  todayCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffd700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffd700',
    marginLeft: 8,
  },
  todayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  todayDescription: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 16,
    lineHeight: 22,
  },
  todayDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  todayDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  todayDetailText: {
    fontSize: 14,
    color: '#4a5568',
    marginLeft: 4,
  },
  startButton: {
    backgroundColor: '#3182ce',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
  
  // Routines Section
  routinesSection: {
    padding: 16,
  },
  routineCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    flex: 1,
  },
  routineDescription: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 12,
    lineHeight: 20,
  },
  routineDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routineDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  routineDetailText: {
    fontSize: 12,
    color: '#4a5568',
    marginLeft: 4,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleGroup: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  muscleGroupText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Recent Section
  recentSection: {
    padding: 16,
    paddingBottom: 32,
  },
  recentCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    flex: 1,
  },
  recentDate: {
    fontSize: 12,
    color: '#4a5568',
  },
  recentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  recentDetailText: {
    fontSize: 12,
    color: '#4a5568',
    marginLeft: 4,
  },
});

export default WorkoutScreen; 