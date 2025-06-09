import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList, Workout } from '../types';

type WorkoutHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutHistory'>;
type WorkoutHistoryScreenRouteProp = RouteProp<RootStackParamList, 'WorkoutHistory'>;

interface Props {
  navigation: WorkoutHistoryScreenNavigationProp;
  route: WorkoutHistoryScreenRouteProp;
}

const WorkoutHistoryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { workout } = route.params;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotalVolume = () => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.weight * set.reps);
      }, 0);
    }, 0);
  };

  const calculateTotalSets = () => {
    return workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  const calculateTotalReps = () => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => exerciseTotal + set.reps, 0);
    }, 0);
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
        <Text style={styles.headerTitle}>Workout Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workout Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.workoutTitle}>{workout.routineName || 'Custom Workout'}</Text>
            <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
            <Text style={styles.workoutTime}>{formatTime(workout.date)}</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color="#3182ce" />
              <Text style={styles.statValue}>{workout.duration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="fitness" size={24} color="#10b981" />
              <Text style={styles.statValue}>{calculateTotalVolume()}</Text>
              <Text style={styles.statLabel}>kg Total</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="layers" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{calculateTotalSets()}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="repeat" size={24} color="#ef4444" />
              <Text style={styles.statValue}>{calculateTotalReps()}</Text>
              <Text style={styles.statLabel}>Reps</Text>
            </View>
          </View>



          {/* Workout Notes */}
          {workout.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Workout Notes</Text>
              <Text style={styles.notesText}>{workout.notes}</Text>
            </View>
          )}
        </View>

        {/* Exercises */}
        <View style={styles.exercisesSection}>
                      <Text style={styles.sectionTitle}>Exercises Performed</Text>
          
          {workout.exercises.map((exercise, exerciseIndex) => (
            <View key={exerciseIndex} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                <View style={styles.exerciseStats}>
                  <Text style={styles.exerciseStatText}>
                    {exercise.sets.length} sets • {exercise.sets.reduce((sum, set) => sum + set.reps, 0)} total reps
                  </Text>
                </View>
              </View>

              {/* Exercise Notes */}
              {exercise.notes && (
                <View style={styles.exerciseNotesContainer}>
                  <Text style={styles.exerciseNotesText}>💭 {exercise.notes}</Text>
                </View>
              )}

              {/* Sets Details */}
              <View style={styles.setsContainer}>
                <View style={styles.setsHeader}>
                  <Text style={styles.setsHeaderText}>Set</Text>
                  <Text style={styles.setsHeaderText}>Weight</Text>
                  <Text style={styles.setsHeaderText}>Reps</Text>
                  <Text style={styles.setsHeaderText}>Rest</Text>
                </View>
                
                {exercise.sets.map((set, setIndex) => (
                  <View key={setIndex} style={styles.setRow}>
                    <View style={styles.setNumber}>
                      <Text style={styles.setNumberText}>{set.setNumber || setIndex + 1}</Text>
                    </View>
                    <View style={styles.setWeight}>
                      <Text style={styles.setValueText}>
                        {set.weight > 0 ? `${set.weight}kg` : 'Bodyweight'}
                      </Text>
                    </View>
                    <View style={styles.setReps}>
                      <Text style={styles.setValueText}>{set.reps}</Text>
                    </View>
                    <View style={styles.setRest}>
                      <Text style={styles.setRestText}>
                        {set.restTime ? `${Math.floor(set.restTime / 60)}:${Math.floor(set.restTime % 60).toString().padStart(2, '0')}` : '--'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Exercise Volume */}
              <View style={styles.exerciseVolumeContainer}>
                <Text style={styles.exerciseVolumeText}>
                  Total Volume: {exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)}kg
                </Text>
                <Text style={styles.exerciseVolumeText}>
                  Max Weight: {Math.max(...exercise.sets.map(set => set.weight))}kg
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Workout Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>📊 Workout Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Exercises</Text>
              <Text style={styles.summaryValue}>{workout.exercises.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Sets</Text>
              <Text style={styles.summaryValue}>{calculateTotalSets()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Reps</Text>
              <Text style={styles.summaryValue}>{calculateTotalReps()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Volume</Text>
              <Text style={styles.summaryValue}>{calculateTotalVolume()}kg</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{workout.duration}min</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Volume/Min</Text>
              <Text style={styles.summaryValue}>{Math.round(calculateTotalVolume() / workout.duration)}kg</Text>
            </View>
          </View>
        </View>

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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#3182ce',
  },
  backButton: {
    padding: 8,
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
    paddingHorizontal: 20,
  },
  overviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
    textAlign: 'center',
  },
  workoutDate: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 4,
  },
  workoutTime: {
    fontSize: 14,
    color: '#718096',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  moodEnergyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  moodEnergyItem: {
    alignItems: 'center',
  },
  moodEnergyLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  moodEnergyValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  notesContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3182ce',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  exercisesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 16,
  },
  exerciseCard: {
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
  exerciseHeader: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseStatText: {
    fontSize: 14,
    color: '#718096',
  },
  exerciseNotesContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  exerciseNotesText: {
    fontSize: 14,
    color: '#1e40af',
    fontStyle: 'italic',
  },
  setsContainer: {
    marginBottom: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#f7fafc',
    borderRadius: 6,
    marginBottom: 8,
  },
  setsHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  setNumber: {
    flex: 1,
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3182ce',
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
    fontWeight: '500',
    color: '#2d3748',
  },
  setRestText: {
    fontSize: 12,
    color: '#718096',
  },

  exerciseVolumeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  exerciseVolumeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '32%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  bottomPadding: {
    height: 40,
  },
});

export default WorkoutHistoryScreen; 