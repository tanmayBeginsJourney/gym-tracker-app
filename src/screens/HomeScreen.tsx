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
import { storageService } from '../services/storage';
import { Workout, UserProfile, WorkoutRoutine } from '../types';
import { defaultRoutines } from '../data/exercises';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [todaysRoutine, setTodaysRoutine] = useState<WorkoutRoutine | null>(null);
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
      const profile = await storageService.getUserProfile();
      const allWorkouts = await storageService.getAllWorkouts();
      
      // Get last 3 workouts
      const recent = allWorkouts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      // Calculate workout streak
      const workoutStreak = calculateWorkoutStreak(allWorkouts);

      setUserProfile(profile);
      setRecentWorkouts(recent);
      setTotalWorkouts(allWorkouts.length);
      setStreak(workoutStreak);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysRoutine = async () => {
    try {
      // Initialize default routines if none exist
      const existingRoutines = await storageService.getAllRoutines();
      if (existingRoutines.length === 0) {
        for (const routine of defaultRoutines) {
          await storageService.saveRoutine(routine);
        }
      }

      // Get today's routine based on day of week
      const routine = getTodaysRoutine();
      setTodaysRoutine(routine);
    } catch (error) {
      console.error('Error loading today\'s routine:', error);
    }
  };

  const getTodaysRoutine = (): WorkoutRoutine | null => {
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Simple scheduling: Push day on Monday/Thursday, Full body on Wednesday/Saturday
    if (dayOfWeek === 1 || dayOfWeek === 4) { // Monday or Thursday
      return defaultRoutines.find(r => r.id === 'push-day') || null;
    } else if (dayOfWeek === 3 || dayOfWeek === 6) { // Wednesday or Saturday
      return defaultRoutines.find(r => r.id === 'beginner-full-body') || null;
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
          { text: 'Browse Routines', onPress: () => navigation.navigate('Workout' as never) }
        ]
      );
      return;
    }

    navigation.navigate('Workout' as never);
  };

  const navigateToWorkouts = () => {
    navigation.navigate('Workout' as never);
  };

  const navigateToAI = () => {
    navigation.navigate('Chat' as never);
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
      name: 'Fitness Enthusiast',
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
              style={styles.customWorkoutButton} 
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
  welcomeSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#4a5568',
  },
  
  // Workout Hero Card Styles
  workoutHeroCard: {
    backgroundColor: '#3182ce',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  workoutHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutHeroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  workoutHeroName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  workoutHeroDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workoutHeroDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutHeroDetailText: {
    fontSize: 14,
    color: '#e2e8f0',
    marginLeft: 4,
  },
  workoutHeroDescription: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  
  // Rest Day Card Styles
  restDayCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
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
    marginLeft: 12,
  },
  restDayText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  restDayButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  customWorkoutButton: {
    backgroundColor: '#3182ce',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  customWorkoutText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  browseRoutinesButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseRoutinesText: {
    color: '#4a5568',
    fontWeight: 'bold',
    fontSize: 16,
  },

  setupCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  setupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginTop: 8,
    marginBottom: 4,
  },
  setupText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#4a5568',
    marginTop: 4,
    textAlign: 'center',
  },
  workoutsSection: {
    padding: 16,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a5568',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 14,
    color: '#4a5568',
  },
  workoutDuration: {
    fontSize: 14,
    color: '#3182ce',
    fontWeight: 'bold',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  workoutExercises: {
    fontSize: 14,
    color: '#718096',
  },
  actionsSection: {
    padding: 16,
    paddingBottom: 32,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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