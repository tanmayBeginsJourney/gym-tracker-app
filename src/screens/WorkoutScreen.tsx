import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { WorkoutRoutine, Workout, RoutineBundle, RootStackParamList } from '../types';
import { storageService } from '../services/storage';
import { defaultRoutines } from '../data/exercises';
import ActiveWorkoutScreen from './ActiveWorkoutScreen';
import WorkoutCompletionScreen from './WorkoutCompletionScreen';
import SidebarNav from '../components/SidebarNav';

type WorkoutState = 'browse' | 'active' | 'complete';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Workout'>;
}

const WorkoutScreen: React.FC<Props> = ({ navigation }) => {
  const [workoutState, setWorkoutState] = useState<WorkoutState>('browse');
  const [availableRoutines, setAvailableRoutines] = useState<WorkoutRoutine[]>([]);
  const [customRoutines, setCustomRoutines] = useState<WorkoutRoutine[]>([]);
  const [defaultBundle, setDefaultBundle] = useState<RoutineBundle | null>(null);
  const [todaysRoutine, setTodaysRoutine] = useState<WorkoutRoutine | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null);
  const [completedWorkout, setCompletedWorkout] = useState<Workout | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMountedRef, setIsMountedRef] = useState(true);

  const loadData = useCallback(async () => {
    try {
      console.log('🔍 Loading workout screen data...');
      setLoading(true);
      const [bundlesData, routinesData, recentWorkoutsData] = await Promise.all([
        storageService.getAllRoutineBundles(),
        storageService.getAllRoutines(),
        storageService.getAllWorkouts()
      ]);

      if (!isMountedRef) return;

      // Initialize with default routines if none exist
      let allRoutines = routinesData;
      if (allRoutines.length === 0) {
        console.log('📥 Initializing with default routines...');
        for (const routine of defaultRoutines) {
          await storageService.saveRoutine(routine);
        }
        allRoutines = [...defaultRoutines];
      }

      const defaultBundle = bundlesData.find(b => b.isDefault) || null;
      if (!isMountedRef) return;
      setDefaultBundle(defaultBundle);
      setAvailableRoutines(allRoutines);

      const customRoutines = allRoutines.filter(r => r.isCustom);
      if (!isMountedRef) return;
      setCustomRoutines(customRoutines);

      // Get today's routine from bundle or fallback
      let todaysRoutine = null;
      if (defaultBundle) {
        const todaysRoutineFromBundle = await storageService.getTodaysRoutine();
        todaysRoutine = todaysRoutineFromBundle;
      }
      
      if (!todaysRoutine) {
        todaysRoutine = getFallbackTodaysRoutine(allRoutines);
      }

      if (!isMountedRef) return;
      setTodaysRoutine(todaysRoutine);

      // Get recent workouts (last 5)
      const sortedWorkouts = recentWorkoutsData
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      if (!isMountedRef) return;
      setRecentWorkouts(sortedWorkouts);
    } catch (error) {
      console.error('❌ Error loading workout screen data:', error);
      Alert.alert('Error', 'Failed to load workout data. Please try again.');
    } finally {
      if (isMountedRef) setLoading(false);
    }
  }, [isMountedRef]);

  useEffect(() => {
    loadData();

    return () => {
      setIsMountedRef(false);
    };
  }, [loadData]);

  // Refresh data when screen comes into focus (after creating routines/bundles)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation, loadData]);

  const getFallbackTodaysRoutine = (routines: WorkoutRoutine[]): WorkoutRoutine | null => {
    const dayOfWeek = new Date().getDay();
    
    // Simple scheduling: Push day on Monday/Thursday, Full body on Wednesday/Saturday
    if (dayOfWeek === 1 || dayOfWeek === 4) { // Monday or Thursday
      // Try multiple fallback strategies for push-style workouts
      return routines.find(r => r.id === 'push-day') || 
             routines.find(r => r.name.toLowerCase().includes('push')) ||
             routines.find(r => r.name.toLowerCase().includes('chest')) ||
             routines.find(r => r.name.toLowerCase().includes('upper')) ||
             routines[0] || null;
    } else if (dayOfWeek === 3 || dayOfWeek === 6) { // Wednesday or Saturday
      // Try multiple fallback strategies for full body workouts
      return routines.find(r => r.id === 'beginner-full-body') ||
             routines.find(r => r.name.toLowerCase().includes('full body')) ||
             routines.find(r => r.name.toLowerCase().includes('beginner')) ||
             routines.find(r => r.name.toLowerCase().includes('total body')) ||
             routines[0] || null;
    }
    
    return null; // Rest days: Tuesday, Friday, Sunday
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
      case 'beginner': return '#2d7d32'; // Darker green for better contrast
      case 'intermediate': return '#e65100'; // Darker orange for better contrast  
      case 'advanced': return '#c62828'; // Darker red for better contrast
      default: return '#37474f'; // Darker gray for better contrast
    }
  };

  const navigateToRoutineBuilder = () => {
    console.log('🏗️ Navigating to routine builder');
    navigation.navigate('RoutineBuilder', {});
  };

  const navigateToBundleManager = () => {
    console.log('📦 Navigating to bundle manager');
    navigation.navigate('BundleManager', {});
  };

  const editRoutine = (routine: WorkoutRoutine) => {
    console.log('✏️ Editing routine:', routine.name);
    navigation.navigate('RoutineBuilder', { editingRoutine: routine });
  };

  const deleteRoutine = (routine: WorkoutRoutine) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true); // Disable interactions during deletion
            try {
              console.log('🗑️ Deleting routine:', routine.name);
              await storageService.deleteRoutine(routine.id);
              await loadData(); // Refresh data
              Alert.alert('Success', `"${routine.name}" has been deleted.`);
            } catch (error: any) {
              console.error('❌ Error deleting routine:', error);
              Alert.alert(
                'Error', 
                error?.message ?? 'Failed to delete routine. Please try again.'
              );
            } finally {
              setLoading(false); // Re-enable interactions
            }
          },
        },
      ]
    );
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
      <View style={styles.container}>
        <SidebarNav currentRoute="Workout" />
        <ActiveWorkoutScreen
          routine={selectedRoutine}
          onComplete={onWorkoutComplete}
          onCancel={onWorkoutCancel}
        />
      </View>
    );
  }

  // Render workout completion screen
  if (workoutState === 'complete' && completedWorkout) {
    return (
      <View style={styles.container}>
        <SidebarNav currentRoute="Workout" />
        <WorkoutCompletionScreen
          workout={completedWorkout}
          onDismiss={onCompletionDismiss}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SidebarNav currentRoute="Workout" />
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Workouts</Text>
            <Text style={styles.headerSubtitle}>Choose your routine and start training</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={navigateToRoutineBuilder}
            >
              <Ionicons name="add" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={navigateToBundleManager}
            >
              <Ionicons name="calendar" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bundle Status */}
        {defaultBundle ? (
          <View style={styles.bundleStatus}>
            <View style={styles.bundleInfo}>
              <Ionicons name="calendar-outline" size={16} color="#4CAF50" />
              <Text style={styles.bundleText}>
                Active Schedule: <Text style={styles.bundleName}>{defaultBundle.name}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={navigateToBundleManager}>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noBundlePrompt}>
            <Text style={styles.noBundleText}>No workout schedule set</Text>
            <TouchableOpacity 
              style={styles.setBundleButton}
              onPress={navigateToBundleManager}
            >
              <Text style={styles.setBundleButtonText}>Create Schedule</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Recommended Workout */}
        {todaysRoutine && (
          <View style={styles.todaySection}>
            <Text style={styles.sectionTitle}>Today's Workout</Text>
            <TouchableOpacity 
              style={styles.todayCard}
              onPress={() => startWorkout(todaysRoutine)}
            >
              <View style={styles.todayHeader}>
                <Ionicons name="star" size={24} color="#ffd700" />
                <Text style={styles.todayLabel}>TODAY</Text>
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

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={navigateToRoutineBuilder}
            >
              <Ionicons name="fitness" size={32} color="#4CAF50" />
              <Text style={styles.quickActionTitle}>Create Routine</Text>
              <Text style={styles.quickActionSubtitle}>Build custom workout</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={navigateToBundleManager}
            >
              <Ionicons name="calendar" size={32} color="#4CAF50" />
              <Text style={styles.quickActionTitle}>Schedule</Text>
              <Text style={styles.quickActionSubtitle}>Plan weekly workouts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Routines */}
        {customRoutines.length > 0 && (
          <View style={styles.routinesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Custom Routines</Text>
              <Text style={styles.sectionCount}>({customRoutines.length})</Text>
            </View>
            {customRoutines.map((routine) => (
              <View key={routine.id} style={styles.routineCard}>
                <TouchableOpacity
                  style={styles.routineMain}
                  onPress={() => startWorkout(routine)}
                >
                  <View style={styles.routineHeader}>
                    <View style={styles.routineTitleSection}>
                      <Text style={styles.routineName}>{routine.name}</Text>
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeText}>Custom</Text>
                      </View>
                    </View>
                  </View>
                  {routine.description && (
                    <Text style={styles.routineDescription} numberOfLines={2}>
                      {routine.description}
                    </Text>
                  )}
                  <View style={styles.routineDetails}>
                    <View style={styles.routineDetail}>
                      <Ionicons name="barbell" size={14} color="#666" />
                      <Text style={styles.routineDetailText}>
                        {routine.exercises.length} exercises
                      </Text>
                    </View>
                    <View style={styles.routineDetail}>
                      <Ionicons name="time" size={14} color="#666" />
                      <Text style={styles.routineDetailText}>
                        ~{routine.estimatedDuration} min
                      </Text>
                    </View>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(routine.difficulty) }]}>
                      <Text style={styles.difficultyText}>{routine.difficulty}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                
                {/* Custom routine actions */}
                <View style={styles.routineActions}>
                  <TouchableOpacity
                    style={styles.routineActionButton}
                    onPress={() => editRoutine(routine)}
                  >
                    <Ionicons name="pencil" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.routineActionButton}
                    onPress={() => deleteRoutine(routine)}
                  >
                    <Ionicons name="trash" size={16} color="#f44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Default Routines */}
        <View style={styles.routinesSection}>
          <Text style={styles.sectionTitle}>Default Routines</Text>
          {availableRoutines.filter(r => !r.isCustom).map((routine) => (
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
              <Text style={styles.routineDescription} numberOfLines={2}>
                {routine.description}
              </Text>
              <View style={styles.routineDetails}>
                <View style={styles.routineDetail}>
                  <Ionicons name="barbell" size={14} color="#666" />
                  <Text style={styles.routineDetailText}>
                    {routine.exercises.length} exercises
                  </Text>
                </View>
                <View style={styles.routineDetail}>
                  <Ionicons name="time" size={14} color="#666" />
                  <Text style={styles.routineDetailText}>
                    ~{routine.estimatedDuration} min
                  </Text>
                </View>
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

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingTop: 80,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
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
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  
  // Bundle Status
  bundleStatus: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  bundleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bundleText: {
    fontSize: 14,
    color: '#4a5568',
  },
  bundleName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  noBundlePrompt: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  noBundleText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 16,
  },
  setBundleButton: {
    backgroundColor: '#3182ce',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  setBundleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Today's Section
  todaySection: {
    padding: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 16,
  },
  sectionCount: {
    fontSize: 14,
    color: '#4a5568',
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
  routineMain: {
    flex: 1,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    flex: 1,
  },
  customBadge: {
    backgroundColor: '#3182ce',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  customBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  routineDescription: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
    lineHeight: 18,
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
  
  // Recent Section
  recentSection: {
    padding: 16,
    paddingBottom: 80,
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
  quickActionsSection: {
    padding: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 4,
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
  routineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  routineActionButton: {
    padding: 8,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default WorkoutScreen; 