import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { demoDataService } from '../services/demoDataService';
import type { DemoProfile, StorageMode } from '../types';

interface ProfileSelectionScreenProps {
  onProfileSelected: (mode: StorageMode) => void;
}

const ProfileSelectionScreen: React.FC<ProfileSelectionScreenProps> = ({ onProfileSelected }) => {
  console.log('📱 ProfileSelectionScreen - Component mounted');
  
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const demoProfiles = demoDataService.getAllDemoProfiles();

  const handleProfileSelection = (profileId: string) => {
    console.log('📱 ProfileSelectionScreen - Profile selected:', profileId);
    setSelectedProfile(profileId);
    
    if (profileId === 'real-user') {
      onProfileSelected({ type: 'real' });
    } else {
      onProfileSelected({ type: 'demo', profileId });
    }
  };

  const showProfileDetails = (profile: DemoProfile) => {
    const totalVolume = profile.workoutHistory.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exerciseSum, exercise) => {
        return exerciseSum + exercise.sets.reduce((setSum, set) => {
          return setSum + (set.weight * set.reps);
        }, 0);
      }, 0);
    }, 0);

    Alert.alert(
      `${profile.avatar} ${profile.name}`,
      `${profile.description}\n\n` +
      `📊 Stats Preview:\n` +
      `• ${profile.workoutHistory.length} workouts completed\n` +
      `• ${Math.floor(totalVolume / 1000)}k kg total weight moved\n` +
      `• ${profile.achievements.length} achievements unlocked\n` +
      `• ${profile.routines.length} custom routines\n\n` +
      `This profile has rich workout history perfect for testing the Progress Analytics!`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const ProfileCard: React.FC<{ profile: DemoProfile }> = ({ profile }) => {
    const totalVolume = profile.workoutHistory.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exerciseSum, exercise) => {
        return exerciseSum + exercise.sets.reduce((setSum, set) => {
          return setSum + (set.weight * set.reps);
        }, 0);
      }, 0);
    }, 0);

    return (
      <TouchableOpacity
        style={[
          styles.profileCard,
          selectedProfile === profile.id && styles.selectedCard,
        ]}
        onPress={() => handleProfileSelection(profile.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.avatar}>{profile.avatar}</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileSubtitle}>
              {profile.demographics.age}yr • {profile.demographics.experienceLevel}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => showProfileDetails(profile)}
          >
            <Ionicons name="information-circle-outline" size={24} color="#3182ce" />
          </TouchableOpacity>
        </View>

        <Text style={styles.profileDescription}>{profile.description}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.workoutHistory.length}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.floor(totalVolume / 1000)}k</Text>
            <Text style={styles.statLabel}>kg Moved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.achievements.length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        <View style={styles.goalsList}>
          {profile.demographics.goals.slice(0, 2).map((goal, index) => (
            <View key={goal} style={styles.goalChip}>
              <Text style={styles.goalText}>
                {goal === 'strength' ? '🏋️ Strength' :
                 goal === 'muscle' ? '🏗️ Muscle' :
                 goal === 'endurance' ? '🏃 Endurance' :
                 goal === 'weight_loss' ? '📉 Weight Loss' : goal}
              </Text>
            </View>
          ))}
        </View>

        {selectedProfile === profile.id && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const RealUserCard: React.FC = () => (
    <TouchableOpacity
      style={[
        styles.profileCard,
        styles.realUserCard,
        selectedProfile === 'real-user' && styles.selectedCard,
      ]}
      onPress={() => handleProfileSelection('real-user')}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.avatar}>👤</Text>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Your Profile</Text>
          <Text style={styles.profileSubtitle}>Real workout tracking</Text>
        </View>
        <View style={styles.realUserBadge}>
          <Text style={styles.realUserBadgeText}>REAL</Text>
        </View>
      </View>

      <Text style={styles.profileDescription}>
        Start your fitness journey with real workout tracking. Your progress will be saved permanently.
      </Text>

      <View style={styles.realUserFeatures}>
        <View style={styles.featureItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" />
          <Text style={styles.featureText}>Your data, your progress</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="trending-up-outline" size={20} color="#10b981" />
          <Text style={styles.featureText}>Real progress tracking</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="save-outline" size={20} color="#10b981" />
          <Text style={styles.featureText}>Permanent workout history</Text>
        </View>
      </View>

      {selectedProfile === 'real-user' && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          <Text style={styles.selectedText}>Selected</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7fafc" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🏋️ Choose Your Profile</Text>
        <Text style={styles.subtitle}>
          Select a demo profile to explore features with sample data, or start with your own profile
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Real User Option */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Real Tracking</Text>
          <RealUserCard />
        </View>

        {/* Demo Profiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Demo Profiles</Text>
          <Text style={styles.sectionSubtitle}>
            Explore the app with rich sample data and see all features in action
          </Text>
          
          {demoProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </View>

        {/* Features Preview */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>✨ What You'll Experience</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📈</Text>
              <Text style={styles.featureTitle}>Progress Analytics</Text>
              <Text style={styles.featureDesc}>Interactive charts and trends</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureTitle}>Achievements</Text>
              <Text style={styles.featureDesc}>Unlocked badges and milestones</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureTitle}>Personal Records</Text>
              <Text style={styles.featureDesc}>Track your strongest lifts</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎉</Text>
              <Text style={styles.featureTitle}>Fun Stats</Text>
              <Text style={styles.featureDesc}>Cars lifted, pizza earned</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#a0aec0',
    marginBottom: 16,
    lineHeight: 20,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  realUserCard: {
    borderColor: '#e2e8f0',
  },
  selectedCard: {
    borderColor: '#3182ce',
    shadowColor: '#3182ce',
    shadowOpacity: 0.2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  infoButton: {
    padding: 4,
  },
  realUserBadge: {
    backgroundColor: '#f0fff4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  realUserBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
  },
  profileDescription: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3182ce',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
  },
  goalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  goalChip: {
    backgroundColor: '#ebf8ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  goalText: {
    fontSize: 12,
    color: '#3182ce',
    fontWeight: '600',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginLeft: 6,
  },
  realUserFeatures: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4a5568',
    marginLeft: 8,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ProfileSelectionScreen; 