import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Workout, ProgressRecord } from '../types';
import { storageService } from '../services/storage';

interface Props {
  workout: Workout;
  onDismiss: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const WorkoutCompletionScreen: React.FC<Props> = ({ workout, onDismiss }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [personalRecords, setPersonalRecords] = useState<ProgressRecord[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    analyzeWorkout();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const analyzeWorkout = async () => {
    try {
      // Calculate total volume
      const volume = workout.exercises.reduce((total, exercise) => {
        return total + exercise.sets.reduce((exerciseTotal, set) => {
          return exerciseTotal + (set.weight * set.reps);
        }, 0);
      }, 0);
      setTotalVolume(volume);

      // Check for personal records
      const allWorkouts = await storageService.getAllWorkouts();
      const newPRs: ProgressRecord[] = [];
      
      for (const exercise of workout.exercises) {
        // Find best previous performance for this exercise
        const previousWorkouts = allWorkouts.filter(w => 
          w.id !== workout.id && 
          w.exercises.some(e => e.exerciseId === exercise.exerciseId)
        );

        let previousBest = 0;
        for (const prevWorkout of previousWorkouts) {
          const prevExercise = prevWorkout.exercises.find(e => e.exerciseId === exercise.exerciseId);
          if (prevExercise) {
            const maxWeight = Math.max(...prevExercise.sets.map(s => s.weight));
            previousBest = Math.max(previousBest, maxWeight);
          }
        }

        // Check if current workout has new PR
        const currentBest = Math.max(...exercise.sets.map(s => s.weight));
        if (currentBest > previousBest) {
          newPRs.push({
            date: workout.date,
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            maxWeight: currentBest,
            maxReps: Math.max(...exercise.sets.map(s => s.reps)),
            totalVolume: exercise.sets.reduce((total, set) => total + (set.weight * set.reps), 0)
          });
        }
      }
      setPersonalRecords(newPRs);

      // Generate achievements
      const workoutAchievements = await generateAchievements(workout, allWorkouts, volume, newPRs);
      setAchievements(workoutAchievements);

      // Save progress records
      for (const pr of newPRs) {
        await storageService.saveProgressRecord(pr);
      }

    } catch (error) {
      console.error('Error analyzing workout:', error);
    }
  };

  const generateAchievements = async (
    currentWorkout: Workout,
    allWorkouts: Workout[],
    volume: number,
    newPRs: ProgressRecord[]
  ): Promise<Achievement[]> => {
    const achievements: Achievement[] = [];

    // Personal record achievements
    if (newPRs.length > 0) {
      achievements.push({
        id: 'new-pr',
        title: `${newPRs.length} New Personal Record${newPRs.length > 1 ? 's' : ''}! 🏆`,
        description: newPRs.map(pr => `${pr.exerciseName}: ${pr.maxWeight}kg`).join(', '),
        icon: 'trophy',
        color: '#ffd700'
      });
    }

    // Consistency achievements
    const recentWorkouts = allWorkouts
      .filter(w => {
        const daysDiff = Math.floor((new Date().getTime() - new Date(w.date).getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      });

    if (recentWorkouts.length >= 3) {
      achievements.push({
        id: 'consistency',
        title: 'Consistency Champion! 🔥',
        description: `${recentWorkouts.length} workouts this week`,
        icon: 'flame',
        color: '#ff8c00'
      });
    }

    // Volume achievements
    if (volume >= 5000) {
      achievements.push({
        id: 'high-volume',
        title: 'Volume Beast! 💪',
        description: `${Math.round(volume)}kg total volume`,
        icon: 'barbell',
        color: '#3182ce'
      });
    }

    // Duration achievements
    if (currentWorkout.duration >= 60) {
      achievements.push({
        id: 'endurance',
        title: 'Endurance Warrior! ⏱️',
        description: `${currentWorkout.duration} minute workout`,
        icon: 'time',
        color: '#38a169'
      });
    }

    // Milestone achievements
    const totalWorkouts = allWorkouts.length;
    if (totalWorkouts === 10 || totalWorkouts === 25 || totalWorkouts === 50 || totalWorkouts === 100) {
      achievements.push({
        id: 'milestone',
        title: `${totalWorkouts} Workout Milestone! 🎯`,
        description: 'Keep up the amazing progress',
        icon: 'medal',
        color: '#9f7aea'
      });
    }

    return achievements;
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Outstanding work! Every rep counts! 💪",
      "You're getting stronger with each workout! 🔥",
      "Consistency is key, and you're nailing it! ⭐",
      "Another step closer to your goals! 🎯",
      "Your dedication is paying off! 👏",
      "Beast mode: ACTIVATED! 🦾",
      "Progress over perfection - you're doing great! 📈"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Celebration Header */}
          <View style={styles.celebrationHeader}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>Workout Complete!</Text>
            <Text style={styles.motivationalMessage}>{getMotivationalMessage()}</Text>
          </View>

          {/* Workout Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{workout.routineName || 'Custom Workout'}</Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Ionicons name="time" size={20} color="#3182ce" />
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="barbell" size={20} color="#3182ce" />
                <Text style={styles.statLabel}>Exercises</Text>
                <Text style={styles.statValue}>{workout.exercises.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trending-up" size={20} color="#3182ce" />
                <Text style={styles.statLabel}>Total Volume</Text>
                <Text style={styles.statValue}>{Math.round(totalVolume)}kg</Text>
              </View>
            </View>
          </View>

          {/* Achievements */}
          {achievements.length > 0 && (
            <View style={styles.achievementsSection}>
              <Text style={styles.achievementsTitle}>Achievements Unlocked!</Text>
              {achievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                    <Ionicons name={achievement.icon as any} size={24} color="#ffffff" />
                  </View>
                  <View style={styles.achievementText}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Personal Records */}
          {personalRecords.length > 0 && (
            <View style={styles.recordsSection}>
              <Text style={styles.recordsTitle}>New Personal Records! 🏆</Text>
              {personalRecords.map((record, index) => (
                <View key={index} style={styles.recordCard}>
                  <Text style={styles.recordExercise}>{record.exerciseName}</Text>
                  <Text style={styles.recordWeight}>{record.maxWeight}kg</Text>
                </View>
              ))}
            </View>
          )}

          {/* Exercise Summary */}
          <View style={styles.exercisesSection}>
            <Text style={styles.exercisesTitle}>Exercise Summary</Text>
            {workout.exercises.map((exercise, index) => {
              const totalSets = exercise.sets.length;
              const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);
              const maxWeight = Math.max(...exercise.sets.map(set => set.weight));
              
              return (
                <View key={index} style={styles.exerciseCard}>
                  <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                  <Text style={styles.exerciseStats}>
                    {totalSets} sets • {totalReps} reps • {maxWeight}kg max
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-social" size={20} color="#3182ce" />
            <Text style={styles.shareButtonText}>Share Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueButton} onPress={onDismiss}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '85%',
    paddingVertical: 24,
  },
  celebrationHeader: {
    alignItems: 'center',
    padding: 20,
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  motivationalMessage: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: '#f7fafc',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#4a5568',
    marginTop: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  achievementsSection: {
    margin: 16,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#4a5568',
  },
  recordsSection: {
    margin: 16,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 12,
  },
  recordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffd700',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  recordExercise: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  recordWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  exercisesSection: {
    margin: 16,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 2,
  },
  exerciseStats: {
    fontSize: 14,
    color: '#4a5568',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3182ce',
    marginLeft: 8,
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#3182ce',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default WorkoutCompletionScreen; 