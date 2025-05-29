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
import { storageService } from '../services/storage';
import { Workout, UserProfile } from '../types';

const HomeScreen: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const profile = await storageService.getUserProfile();
      const allWorkouts = await storageService.getAllWorkouts();
      
      // Get last 3 workouts
      const recent = allWorkouts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      setUserProfile(profile);
      setRecentWorkouts(recent);
      setTotalWorkouts(allWorkouts.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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
          Welcome{userProfile ? `, ${userProfile.name}` : ''}! 💪
        </Text>
        <Text style={styles.subtitleText}>
          {totalWorkouts === 0 
            ? "Ready to start your fitness journey?"
            : `You've completed ${totalWorkouts} workout${totalWorkouts === 1 ? '' : 's'}!`
          }
        </Text>
      </View>

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
            <Ionicons name="calendar" size={24} color="#ff8c00" />
            <Text style={styles.statNumber}>
              {recentWorkouts.length > 0 ? '1' : '0'}
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
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
              Tap the Workout tab to get started!
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
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="add-circle" size={32} color="#3182ce" />
            <Text style={styles.actionText}>New Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="restaurant" size={32} color="#ff8c00" />
            <Text style={styles.actionText}>Log Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
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