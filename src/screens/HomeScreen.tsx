import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserProfile, Workout, WorkoutRoutine, RoutineBundle } from '../types';
import { storageService } from '../services/storage';
import { defaultRoutines } from '../data/exercises';
import ActiveWorkoutScreen from './ActiveWorkoutScreen';
import WorkoutCompletionScreen from './WorkoutCompletionScreen';
import type { RootStackParamList } from '../types';
import Constants from 'expo-constants';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Environment-based configuration for demo vs production
const { DEFAULT_USER_NAME = 'Fitness Enthusiast', DEMO_MODE } = Constants.manifest?.extra ?? {};
const IS_DEMO_MODE = __DEV__ || DEMO_MODE === 'true';

type HomeState = 'dashboard' | 'active' | 'complete';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [homeState, setHomeState] = useState<HomeState>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [todaysRoutine, setTodaysRoutine] = useState<WorkoutRoutine | null>(null);
  const [defaultBundle, setDefaultBundle] = useState<RoutineBundle | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null);
  const [completedWorkout, setCompletedWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadDashboardData();
    loadTodaysRoutine();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
      loadTodaysRoutine();
    });

    return unsubscribe;
  }, [navigation]);

  const loadDashboardData = async () => {
    try {
      // Only set loading if not already loading
      if (!loading) setLoading(true);
      
      let profile = await storageService.getUserProfile();
      console.log('🏠 HomeScreen - Initial profile load:', profile);
      
      // Update profile name if needed (for demo mode only)
      if (IS_DEMO_MODE && (!profile || profile.name !== DEFAULT_USER_NAME)) {
        console.log('🏠 HomeScreen - Demo mode: Setting demo profile...');
        const updatedProfile: UserProfile = profile ? {
          ...profile,
          name: DEFAULT_USER_NAME
        } : {
          id: 'user-1',
          name: DEFAULT_USER_NAME,
          age: 25,
          weight: 70,
          height: 175,
          gender: 'male',
          experienceLevel: 'intermediate',
          goals: ['strength', 'muscle'],
          createdAt: new Date(),
          personalDetails: {
            targetPhysique: 'lean_muscle',
            bodyFatGoal: 12,
            specificGoals: ['visible abs', 'vascularity', 'bigger shoulders'],
            weakBodyParts: ['legs', 'back', 'forearms'],
            priorityMuscles: ['quadriceps', 'lats', 'forearm flexors'],
            preferredWorkoutStyle: 'bodybuilding',
            workoutFrequency: 5,
            sessionDuration: 75,
            restDayPreferences: ['active recovery', 'light cardio'],
            injuries: [],
            allergies: [],
            dietaryRestrictions: [],
            motivationalFactors: ['progress photos', 'strength gains', 'compliments'],
            personalChallenges: ['consistency', 'diet discipline'],
            additionalNotes: 'Wants lean physique with good muscle definition. Struggles with leg development and back strength. Very motivated by visible progress.'
          }
        };
        await storageService.saveUserProfile(updatedProfile);
        profile = updatedProfile;
        console.log('🏠 HomeScreen - Profile updated:', profile.name);
      }
      
      const allWorkouts = await storageService.getAllWorkouts();
      
      // Get last 3 workouts
      const recent = allWorkouts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      // Calculate workout streak
      const workoutStreak = calculateWorkoutStreak(allWorkouts);

      setUserProfile(profile);
      console.log('🏠 HomeScreen - Profile set to state:', profile?.name);
      setRecentWorkouts(recent);
      setTotalWorkouts(allWorkouts.length);
      setStreak(workoutStreak);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysRoutine = async () => {
    try {
      // Load default bundle
      const bundle = await storageService.getDefaultRoutineBundle();
      setDefaultBundle(bundle);

      // Initialize default routines if none exist
      const existingRoutines = await storageService.getAllRoutines();
      if (existingRoutines.length === 0) {
        for (const routine of defaultRoutines) {
          await storageService.saveRoutine(routine);
        }
      }

      // First, try to get routine from default bundle system
      const todaysRoutineFromBundle = await storageService.getTodaysRoutine();
      if (todaysRoutineFromBundle) {
        setTodaysRoutine(todaysRoutineFromBundle);
        return;
      }

      // Fallback: Use simple day-based scheduling with all available routines
      const allRoutines = await storageService.getAllRoutines();
      const routine = getFallbackTodaysRoutine(allRoutines);
      setTodaysRoutine(routine);
    } catch (error) {
      console.error('❌ Error loading today\'s routine:', error);
      Alert.alert('Error', 'Failed to load today\'s routine. Please try again.');
    }
  };

  const getFallbackTodaysRoutine = (allRoutines: WorkoutRoutine[]): WorkoutRoutine | null => {
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Simple scheduling: Push day on Monday/Thursday, Full body on Wednesday/Saturday
    if (dayOfWeek === 1 || dayOfWeek === 4) { // Monday or Thursday
      return allRoutines.find(r => r.id === 'push-day') || null;
    } else if (dayOfWeek === 3 || dayOfWeek === 6) { // Wednesday or Saturday
      return allRoutines.find(r => r.id === 'beginner-full-body') || null;
    }
    
    return null; // Rest days: Tuesday, Friday, Sunday
  };

  const calculateWorkoutStreak = (workouts: Workout[]): number => {
    if (workouts.length === 0) return 0;
    
    // Group workouts by day to avoid counting multiple workouts on same day
    const workoutDays = new Set<string>();
    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const dayKey = workoutDate.toDateString(); // "Fri Jan 01 2025" format
      workoutDays.add(dayKey);
    });
    
    // Convert to sorted array of dates
    const uniqueDays = Array.from(workoutDays)
      .map(dayKey => new Date(dayKey))
      .sort((a, b) => b.getTime() - a.getTime()); // Most recent first
    
    if (uniqueDays.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for comparison
    
    for (let i = 0; i < uniqueDays.length; i++) {
      const workoutDay = new Date(uniqueDays[i]);
      workoutDay.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - workoutDay.getTime()) / (1000 * 60 * 60 * 24));
      
      // For streak calculation: today = 0, yesterday = 1, etc.
      if (daysDiff === i || (i === 0 && daysDiff <= 1)) {
        // Allow today (0) or yesterday (1) for first workout, then consecutive days
        streak++;
      } else if (daysDiff === i + 1) {
        // Allow one day gap
        streak++;
      } else {
        break; // Streak broken
      }
    }
    
    return streak;
  };

  const startTodaysWorkout = () => {
    if (!todaysRoutine) {
      Alert.alert(
        'No Workout Scheduled',
        'Would you like to browse available routines?',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Browse Routines', onPress: () => navigation.navigate('Workout') }
        ]
      );
      return;
    }

    // Start the workout directly using the same pattern as WorkoutScreen
    setSelectedRoutine(todaysRoutine);
    setHomeState('active');
  };

  const onWorkoutComplete = async (workout: Workout) => {
    try {
      // Save the workout
      await storageService.saveWorkout(workout);
      
      // Update state
      setCompletedWorkout(workout);
      setHomeState('complete');
      
      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const onWorkoutCancel = () => {
    setSelectedRoutine(null);
    setHomeState('dashboard');
  };

  const onCompletionDismiss = () => {
    setCompletedWorkout(null);
    setHomeState('dashboard');
  };

  const navigateToWorkouts = () => {
    try {
      navigation.navigate('Workout');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to workouts. Please try again.');
    }
  };

  const navigateToAI = () => {
    navigation.navigate('Chat');
  };

  const navigateToBundleManager = () => {
    try {
      console.log('📦 Navigating to bundle manager');
      navigation.navigate('BundleManager', {});
    } catch (error) {
      console.error('❌ Navigation error to bundle manager:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to bundle manager. Please try again.');
    }
  };

  const setupProfile = () => {
    Alert.alert(
      'Setup Profile',
      'Would you like to create your fitness profile now?',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Yes', onPress: createDemoProfile }
      ]
    );
  };

  const createDemoProfile = async () => {
    const demoProfile: UserProfile = {
      id: 'user-1',
      name: DEFAULT_USER_NAME,
      age: 25,
      weight: 70,
      height: 175,
      gender: 'male',
      experienceLevel: 'intermediate',
      goals: ['strength', 'muscle'],
      createdAt: new Date(),
      personalDetails: {
        targetPhysique: 'lean_muscle',
        bodyFatGoal: 12,
        specificGoals: ['visible abs', 'vascularity', 'bigger shoulders'],
        weakBodyParts: ['legs', 'back', 'forearms'],
        priorityMuscles: ['quadriceps', 'lats', 'forearm flexors'],
        preferredWorkoutStyle: 'bodybuilding',
        workoutFrequency: 5,
        sessionDuration: 75,
        restDayPreferences: ['active recovery', 'light cardio'],
        injuries: [],
        allergies: [],
        dietaryRestrictions: [],
        motivationalFactors: ['progress photos', 'strength gains', 'compliments'],
        personalChallenges: ['consistency', 'diet discipline'],
        additionalNotes: 'Wants lean physique with good muscle definition. Struggles with leg development and back strength. Very motivated by visible progress.'
      }
    };

    try {
      await storageService.saveUserProfile(demoProfile);
      setUserProfile(demoProfile);
      Alert.alert('Success', 'Profile created with detailed fitness preferences! Your AI coach now knows you personally.');
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDayOfWeekText = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Render active workout screen
  if (homeState === 'active' && selectedRoutine) {
    return (
      <ActiveWorkoutScreen
        routine={selectedRoutine}
        onComplete={onWorkoutComplete}
        onCancel={onWorkoutCancel}
      />
    );
  }

  // Render workout completion screen
  if (homeState === 'complete' && completedWorkout) {
    return (
      <WorkoutCompletionScreen
        workout={completedWorkout}
        onDismiss={onCompletionDismiss}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          {getDayOfWeekText()}{userProfile ? `, ${userProfile.name}` : ''}! 💪
        </Text>
        <Text style={styles.subtitleText}>
          {totalWorkouts === 0 
            ? "Ready to start your fitness journey?"
            : streak > 0
            ? `${streak} day streak! Keep it going! 🔥`
            : `You've completed ${totalWorkouts} workout${totalWorkouts === 1 ? '' : 's'}!`
          }
        </Text>
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

      {/* Today's Workout Hero Section */}
      {todaysRoutine ? (
        <TouchableOpacity style={styles.workoutHeroCard} onPress={startTodaysWorkout}>
          <View style={styles.workoutHeroHeader}>
            <Ionicons name="fitness" size={32} color="#ffffff" />
            <Text style={styles.workoutHeroTitle}>START TODAY'S WORKOUT</Text>
          </View>
          <Text style={styles.workoutHeroName}>{todaysRoutine.name}</Text>
          <View style={styles.workoutHeroDetails}>
            <View style={styles.workoutHeroDetail}>
              <Ionicons name="barbell" size={16} color="#e2e8f0" />
              <Text style={styles.workoutHeroDetailText}>
                {todaysRoutine.exercises.length} exercises
              </Text>
            </View>
            <View style={styles.workoutHeroDetail}>
              <Ionicons name="time" size={16} color="#e2e8f0" />
              <Text style={styles.workoutHeroDetailText}>
                ~{todaysRoutine.estimatedDuration} min
              </Text>
            </View>
            <View style={styles.workoutHeroDetail}>
              <Ionicons name="trending-up" size={16} color="#e2e8f0" />
              <Text style={styles.workoutHeroDetailText}>
                {todaysRoutine.difficulty}
              </Text>
            </View>
          </View>
          <Text style={styles.workoutHeroDescription}>
            {todaysRoutine.description}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.restDayCard}>
          <View style={styles.restDayHeader}>
            <Ionicons name="bed" size={32} color="#4a5568" />
            <Text style={styles.restDayTitle}>Rest Day</Text>
          </View>
          <Text style={styles.restDayText}>
            Great job on your recent workouts! Today is for recovery.
          </Text>
          <View style={styles.restDayButtons}>
            <TouchableOpacity 
              style={[styles.customWorkoutButton, styles.restDayButtonChild]} 
              onPress={navigateToWorkouts}
            >
              <Ionicons name="fitness" size={20} color="#ffffff" />
              <Text style={styles.customWorkoutText}>Start Custom Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.browseRoutinesButton} 
              onPress={navigateToWorkouts}
            >
              <Text style={styles.browseRoutinesText}>Browse Available Routines</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Profile Setup */}
      {!userProfile && (
        <TouchableOpacity style={styles.setupCard} onPress={setupProfile}>
          <Ionicons name="person-add" size={24} color="#3182ce" />
          <Text style={styles.setupTitle}>Setup Your Profile</Text>
          <Text style={styles.setupText}>
            Add your details to get personalized recommendations
          </Text>
        </TouchableOpacity>
      )}

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="fitness" size={24} color="#3182ce" />
            <Text style={styles.statNumber}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#ff8c00" />
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#ffd700" />
            <Text style={styles.statNumber}>
              {Math.max(0, totalWorkouts - 1)}
            </Text>
            <Text style={styles.statLabel}>Personal Records</Text>
          </View>
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.workoutsSection}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell" size={48} color="#cbd5e0" />
            <Text style={styles.emptyStateText}>No workouts yet</Text>
            <Text style={styles.emptyStateSubtext}>
              {todaysRoutine ? 'Tap "START TODAY\'S WORKOUT" above!' : 'Tap the Workout tab to get started!'}
            </Text>
          </View>
        ) : (
          recentWorkouts.map((workout, index) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutDate}>
                  {formatDate(workout.date)}
                </Text>
                <Text style={styles.workoutDuration}>
                  {workout.duration} min
                </Text>
              </View>
              <Text style={styles.workoutName}>
                {workout.routineName || 'Custom Workout'}
              </Text>
              <Text style={styles.workoutExercises}>
                {workout.exercises.length} exercise{workout.exercises.length === 1 ? '' : 's'}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={navigateToWorkouts}>
            <Ionicons name="add-circle" size={32} color="#3182ce" />
            <Text style={styles.actionText}>Custom Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="restaurant" size={32} color="#ff8c00" />
            <Text style={styles.actionText}>Log Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={navigateToAI}>
            <Ionicons name="chatbubble" size={32} color="#9f7aea" />
            <Text style={styles.actionText}>Ask AI Coach</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#4a5568',
  },
  bundleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e6ffe6',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  bundleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bundleText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  bundleName: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  noBundlePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff3cd',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  noBundleText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 12,
  },
  setBundleButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  setBundleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  workoutHeroCard: {
    backgroundColor: '#667eea', // Gradient fallback
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  workoutHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutHeroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  workoutHeroName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  workoutHeroDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  workoutHeroDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutHeroDetailText: {
    fontSize: 14,
    color: '#e2e8f0',
    marginLeft: 4,
  },
  workoutHeroDescription: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  restDayCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  restDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restDayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a5568',
    marginLeft: 8,
  },
  restDayText: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 22,
    marginBottom: 16,
  },
  restDayButtons: {
    flexDirection: 'column',
  },
  customWorkoutButton: {
    backgroundColor: '#3182ce',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  restDayButtonChild: {
    marginBottom: 8,
  },
  customWorkoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  browseRoutinesButton: {
    backgroundColor: '#f7fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  browseRoutinesText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '500',
  },
  setupCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginLeft: 12,
    marginBottom: 4,
  },
  setupText: {
    fontSize: 14,
    color: '#4a5568',
    marginLeft: 12,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  workoutsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4a5568',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  workoutCard: {
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
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 14,
    color: '#718096',
  },
  workoutDuration: {
    fontSize: 14,
    color: '#718096',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  workoutExercises: {
    fontSize: 14,
    color: '#4a5568',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    color: '#4a5568',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen; 