import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutRoutine, Workout, WorkoutExercise, WorkoutSet, ActiveWorkoutSession } from '../types';
import { storageService } from '../services/storage';

interface Props {
  routine: WorkoutRoutine;
  onComplete: (workout: Workout) => void;
  onCancel: () => void;
}

const ActiveWorkoutScreen: React.FC<Props> = ({ routine, onComplete, onCancel }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutStartTime] = useState(new Date());
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showRepsModal, setShowRepsModal] = useState(false);
  const [tempWeight, setTempWeight] = useState('');
  const [tempReps, setTempReps] = useState('');
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isInfiniteRest, setIsInfiniteRest] = useState(false);
  const [infiniteRestStartTime, setInfiniteRestStartTime] = useState<Date | null>(null);
  const [initialRestTime, setInitialRestTime] = useState(90);
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<ActiveWorkoutSession | null>(null);

  const currentExercise = routine.exercises[currentExerciseIndex];
  const currentWorkoutExercise = workoutExercises[currentExerciseIndex];

  useEffect(() => {
    initializeWorkout();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0 && !isInfiniteRest) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            Vibration.vibrate([0, 500, 200, 500]); // Rest complete vibration
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer, isInfiniteRest]);

  // Separate useEffect for infinite rest timer display updates
  const [infiniteDisplayTime, setInfiniteDisplayTime] = useState(0);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInfiniteRest && infiniteRestStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - infiniteRestStartTime.getTime()) / 1000);
        setInfiniteDisplayTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInfiniteRest, infiniteRestStartTime]);

  const initializeWorkout = async () => {
    console.log('🏋️ Initializing workout:', routine.name);
    console.log('📋 Routine exercises:', routine.exercises.length);
    
    // Check if there's an existing active workout session
    const existingSession = await storageService.getActiveWorkoutSession();
    
    if (existingSession && existingSession.routine.id === routine.id) {
      // Resume existing session
      console.log('🔄 Resuming existing workout session');
      setCurrentExerciseIndex(existingSession.currentExerciseIndex);
      setWorkoutExercises(existingSession.workoutExercises);
      setCurrentSets(existingSession.currentSets);
      setCurrentSetIndex(existingSession.currentSetIndex);
      setIsResting(existingSession.isResting);
      setIsInfiniteRest(existingSession.isInfiniteRest);
      setInfiniteRestStartTime(existingSession.infiniteRestStartTime ? new Date(existingSession.infiniteRestStartTime) : null);
      
      // Calculate accurate rest timer based on elapsed time if resting
      if (existingSession.isResting && existingSession.restTimer > 0) {
        const sessionAge = (new Date().getTime() - new Date(existingSession.lastActivity).getTime()) / 1000;
        const remainingTime = Math.max(0, existingSession.restTimer - Math.floor(sessionAge));
        setRestTimer(remainingTime);
        console.log(`⏱️ Resumed rest timer: ${remainingTime}s remaining (was ${existingSession.restTimer}s, ${Math.floor(sessionAge)}s elapsed)`);
      } else {
        setRestTimer(existingSession.restTimer || 0);
      }
      
      setActiveWorkoutSession(existingSession);
      
      Alert.alert(
        'Resume Workout?',
        `You have an active workout session for "${routine.name}". Would you like to continue where you left off?`,
        [
          {
            text: 'Start Fresh',
            style: 'destructive',
            onPress: () => startFreshWorkout(),
          },
          {
            text: 'Resume',
            style: 'default',
            onPress: () => {
              console.log('✅ User chose to resume workout session');
            },
          },
        ]
      );
    } else {
      // Start fresh workout
      startFreshWorkout();
    }
  };

  const startFreshWorkout = async () => {
    console.log('🆕 Starting fresh workout');
    
    const firstExercise = routine.exercises[0];
    if (firstExercise) {
      console.log('🎯 First exercise:', firstExercise.exerciseName, 'Sets:', firstExercise.plannedSets, 'Reps:', firstExercise.plannedReps);
    }
    
    setCurrentExerciseIndex(0);
    setCurrentSets([]);
    setCurrentSetIndex(0);
    setIsResting(false);
    setRestTimer(0);
    setIsInfiniteRest(false);
    setInfiniteRestStartTime(null);
    setInfiniteDisplayTime(0);
    
    // Initialize workout exercises array
    const initialExercises: WorkoutExercise[] = routine.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: [],
      notes: ''
    }));
    setWorkoutExercises(initialExercises);
    
    // Create and save new active workout session
    const newSession: ActiveWorkoutSession = {
      id: `workout-session-${Date.now()}`,
      routine,
      startTime: workoutStartTime.toISOString(),
      currentExerciseIndex: 0,
      workoutExercises: initialExercises,
      currentSets: [],
      currentSetIndex: 0,
      restTimer: 0,
      isResting: false,
      isInfiniteRest: false,
      infiniteRestStartTime: null,
      lastActivity: new Date().toISOString(),
    };
    
    await storageService.saveActiveWorkoutSession(newSession);
    setActiveWorkoutSession(newSession);
    
    // Load defaults for first exercise
    await loadPreviousPerformance();
  };

  const loadPreviousPerformance = async () => {
    try {
      console.log('📊 Loading previous performance for exercise:', currentExercise.exerciseName);
      const allWorkouts = await storageService.getAllWorkouts();
      const recentWorkouts = allWorkouts
        .filter(w => w.exercises.some(e => e.exerciseId === currentExercise.exerciseId))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      if (recentWorkouts.length > 0) {
        const lastExercise = recentWorkouts[0].exercises.find(e => e.exerciseId === currentExercise.exerciseId);
        if (lastExercise && lastExercise.sets.length > 0) {
          const lastSet = lastExercise.sets[lastExercise.sets.length - 1];
          // Pre-fill with last performance
          setTempWeight(lastSet.weight?.toString() || '20');
          setTempReps(lastSet.reps?.toString() || '10');
          console.log('✅ Loaded previous performance:', lastSet.weight, 'kg x', lastSet.reps, 'reps');
        }
      } else {
        // Use routine defaults
        const defaultWeight = currentExercise.plannedWeight?.toString() || '20';
        const defaultReps = currentExercise.plannedReps?.toString() || '10';
        setTempWeight(defaultWeight);
        setTempReps(defaultReps);
        console.log('📝 Using routine defaults:', defaultWeight, 'kg x', defaultReps, 'reps');
      }
    } catch (error) {
      console.error('❌ Error loading previous performance:', error);
      // Fallback to safe defaults
      const safeWeight = currentExercise.plannedWeight?.toString() || '20';
      const safeReps = currentExercise.plannedReps?.toString() || '10';
      setTempWeight(safeWeight);
      setTempReps(safeReps);
      console.log('🔧 Using fallback defaults:', safeWeight, 'kg x', safeReps, 'reps');
    }
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(tempWeight) || 0;
    const newWeight = Math.max(0, current + delta);
    setTempWeight(newWeight.toString());
  };

  const adjustReps = (delta: number) => {
    const current = parseInt(tempReps) || 0;
    const newReps = Math.max(0, current + delta);
    setTempReps(newReps.toString());
  };

  const logSet = () => {
    const weight = parseFloat(tempWeight) || 0;
    const reps = parseInt(tempReps) || 0;

    if (weight <= 0 || reps <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid weight and reps');
      return;
    }

    // Calculate actual rest time taken
    let actualRestTime = 90; // Default
    if (isInfiniteRest && infiniteRestStartTime) {
      actualRestTime = Math.floor((new Date().getTime() - infiniteRestStartTime.getTime()) / 1000);
    } else if (isResting) {
      // For regular timer, calculate time elapsed vs initial time
      actualRestTime = initialRestTime - restTimer;
    }

    const newSet: WorkoutSet = {
      setNumber: currentSets.length + 1,
      reps,
      weight,
      completed: true,
      restTime: actualRestTime
    };

    // Update the current exercise's sets
    const updatedExercises = [...workoutExercises];
    if (!updatedExercises[currentExerciseIndex]) {
      updatedExercises[currentExerciseIndex] = {
        exerciseId: currentExercise.exerciseId,
        exerciseName: currentExercise.exerciseName,
        sets: [],
        notes: ''
      };
    }
    updatedExercises[currentExerciseIndex].sets.push(newSet);
    setWorkoutExercises(updatedExercises);

    // Update current sets for display
    setCurrentSets([...currentSets, newSet]);
    setCurrentSetIndex(currentSetIndex + 1);

    // Provide feedback
    Vibration.vibrate(100);

    // Check if exercise is complete
    const targetSets = currentExercise.plannedSets;
    const completedSets = updatedExercises[currentExerciseIndex].sets.length;

    if (completedSets >= targetSets) {
      // Exercise complete
      Alert.alert(
        'Exercise Complete! 🎉',
        `Great job on ${currentExercise.exerciseName}!`,
        [
          { text: 'Next Exercise', onPress: moveToNextExercise },
          { text: 'Add Extra Set', onPress: startRestTimer }
        ]
      );
    } else {
      startRestTimer();
    }
  };

  const startRestTimer = () => {
    setInitialRestTime(90);
    setRestTimer(90); // 90 seconds default
    setIsResting(true);
    setIsInfiniteRest(false);
    setInfiniteRestStartTime(null);
  };

  const skipRest = () => {
    setRestTimer(0);
    setIsResting(false);
    setIsInfiniteRest(false);
    setInfiniteRestStartTime(null);
    setInfiniteDisplayTime(0);
  };

  const adjustRestTimer = (seconds: number) => {
    if (!isInfiniteRest) {
      setRestTimer(prev => Math.max(0, prev + seconds));
    }
  };

  const toggleInfiniteRest = () => {
    if (isInfiniteRest) {
      // Ending infinite rest - calculate actual time taken
      const actualRestTime = infiniteRestStartTime 
        ? Math.floor((new Date().getTime() - infiniteRestStartTime.getTime()) / 1000)
        : 90;
      console.log(`🎯 Infinite rest ended. Total rest time: ${Math.floor(actualRestTime / 60)}:${(actualRestTime % 60).toString().padStart(2, '0')}`);
      
      setIsInfiniteRest(false);
      setInfiniteRestStartTime(null);
      setInfiniteDisplayTime(0);
      setIsResting(false);
      setRestTimer(0);
    } else {
      // Starting infinite rest
      setIsInfiniteRest(true);
      setInfiniteRestStartTime(new Date());
      setInfiniteDisplayTime(0);
      setRestTimer(0);
      console.log('♾️ Infinite rest mode activated');
    }
  };

  const moveToNextExercise = () => {
    if (currentExerciseIndex < routine.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSets([]);
      setCurrentSetIndex(0);
      setIsResting(false);
      setRestTimer(0);
      setIsInfiniteRest(false);
      setInfiniteRestStartTime(null);
      setInfiniteDisplayTime(0);
      loadPreviousPerformance(); // Load defaults for next exercise
    } else {
      completeWorkout();
    }
  };

  const moveToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      const prevExercise = workoutExercises[currentExerciseIndex - 1];
      setCurrentSets(prevExercise?.sets || []);
      setCurrentSetIndex(prevExercise?.sets?.length || 0);
      setIsResting(false);
      setRestTimer(0);
      setIsInfiniteRest(false);
      setInfiniteRestStartTime(null);
      setInfiniteDisplayTime(0);
    }
  };

  const completeWorkout = () => {
    // Calculate workout duration in minutes
    const currentDuration = Math.round((new Date().getTime() - workoutStartTime.getTime()) / (1000 * 60));
    
    // Validate workout quality before allowing completion
    const exercisesWithSets = workoutExercises.filter(ex => ex.sets.length > 0);
    const totalSets = exercisesWithSets.reduce((total, ex) => total + ex.sets.length, 0);
    const totalVolume = exercisesWithSets.reduce((total, ex) => 
      total + ex.sets.reduce((setTotal, set) => setTotal + (set.weight * set.reps), 0), 0
    );
    
    // 1. Minimum duration validation (2 minutes)
    if (currentDuration < 2) {
      Alert.alert(
        'Workout Too Short ⏱️',
        `Your workout has only lasted ${currentDuration < 1 ? 'less than 1 minute' : `${currentDuration} minute${currentDuration === 1 ? '' : 's'}`}. A workout needs to be at least 2 minutes long to be saved.`,
        [
          { text: 'Continue Workout', style: 'default' }
        ]
      );
      return;
    }
    
    // 2. No exercises completed validation
    if (exercisesWithSets.length === 0) {
      Alert.alert(
        'No Exercises Completed',
        'You need to complete at least one exercise to save this workout.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // 3. Minimal sets validation
    if (totalSets < 3) {
      Alert.alert(
        'Workout Too Short',
        `You've only completed ${totalSets} set${totalSets === 1 ? '' : 's'}. Complete at least 3 sets for a meaningful workout.`,
        [
          { text: 'Continue Workout', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => saveWorkout() }
        ]
      );
      return;
    }
    
    // 4. Very light workout validation
    if (totalVolume < 100) { // Less than 100kg total volume
      Alert.alert(
        'Very Light Workout',
        'This seems like a very light workout. Are you sure you want to save it?',
        [
          { text: 'Continue Workout', style: 'cancel' },
          { text: 'Save Workout', onPress: () => saveWorkout() }
        ]
      );
      return;
    }
    
    saveWorkout();
  };

  const saveWorkout = () => {
    const duration = Math.round((new Date().getTime() - workoutStartTime.getTime()) / (1000 * 60));
    
    const workout: Workout = {
      id: `workout-${Date.now()}`,
      userId: 'user-1', // TODO: Get from auth
      date: new Date(),
      routineId: routine.id,
      routineName: routine.name,
      exercises: workoutExercises.filter(ex => ex.sets.length > 0), // Only include exercises with sets
      duration,
      notes: ''
    };

    // Clear active workout session since workout is complete
    storageService.clearActiveWorkoutSession();
    setActiveWorkoutSession(null);

    onComplete(workout);
  };

  const cancelWorkout = () => {
    Alert.alert(
      'Cancel Workout?',
      'Are you sure you want to cancel? Your progress will be lost.',
      [
        { text: 'Keep Going', style: 'cancel' },
        { 
          text: 'Cancel Workout', 
          style: 'destructive', 
          onPress: async () => {
            console.log('🚫 User cancelled workout - cleaning up session');
            // Clear active workout session first
            await storageService.clearActiveWorkoutSession();
            // Clear local state to stop any ongoing useEffects
            setActiveWorkoutSession(null);
            setIsResting(false);
            setRestTimer(0);
            onCancel();
          }
        }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatInfiniteRestTime = () => {
    return formatTime(infiniteDisplayTime);
  };

  const getProgressText = () => {
    return `Exercise ${currentExerciseIndex + 1} of ${routine.exercises.length}`;
  };

  // Use useMemo to prevent recalculation and logging on every render
  const currentSetText = useMemo(() => {
    const completedSets = currentSets.length;
    const targetSets = currentExercise?.plannedSets || 3;
    return `Set ${completedSets + 1} of ${targetSets}`;
  }, [currentSets.length, currentExercise?.plannedSets]);

  // Separate logging for set changes
  useEffect(() => {
    const completedSets = currentSets.length;
    const targetSets = currentExercise?.plannedSets || 3;
    console.log('📊 Set progress updated:', completedSets, 'completed,', targetSets, 'planned');
  }, [currentSets.length]); // Only log when actual set count changes

  const saveWorkoutSessionState = async () => {
    if (!activeWorkoutSession) {
      console.log('⚠️ No active session to save state for');
      return;
    }

    console.log('💾 Saving workout session state - Exercise:', currentExerciseIndex + 1, 'Sets completed:', currentSets.length);

    const updatedSession: Partial<ActiveWorkoutSession> = {
      currentExerciseIndex,
      workoutExercises,
      currentSets,
      currentSetIndex,
      isResting,
      isInfiniteRest,
      // Don't save restTimer here - it's saved separately to avoid excessive updates
    };

    await storageService.updateActiveWorkoutSession(updatedSession);
  };

  // Save session state only for significant changes (not rest timer)
  useEffect(() => {
    if (activeWorkoutSession) {
      saveWorkoutSessionState();
    }
  }, [currentExerciseIndex, workoutExercises, currentSets, currentSetIndex, isResting, isInfiniteRest]);

  // Save rest state only on start/stop, not during countdown
  useEffect(() => {
    if (activeWorkoutSession) {
      // Save when rest starts or stops, but not during countdown
      storageService.updateActiveWorkoutSession({ 
        isResting,
        isInfiniteRest,
        infiniteRestStartTime: infiniteRestStartTime?.toISOString() || null,
        // Save initial rest timer value when rest starts
        ...(isResting && restTimer > 0 ? { restTimer } : {})
      });
    }
  }, [isResting, isInfiniteRest, activeWorkoutSession]); // Removed restTimer to prevent excessive saves

  // Add safety check for currentExercise
  if (!currentExercise) {
    return (
      <View style={styles.container}>
        <Text>Exercise not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={cancelWorkout}>
          <Ionicons name="close" size={24} color="#4a5568" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.routineName}>{routine.name}</Text>
          <Text style={styles.progressText}>{getProgressText()}</Text>
        </View>
        <TouchableOpacity onPress={completeWorkout}>
          <Text style={styles.finishButton}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Rest Timer */}
      {isResting && (
        <View style={styles.restContainer}>
          <Text style={styles.restTitle}>Rest Time</Text>
          <Text style={styles.restTimer}>
            {isInfiniteRest ? formatInfiniteRestTime() : formatTime(restTimer)}
          </Text>
          
          {/* Rest Timer Controls */}
          <View style={styles.restControls}>
            {!isInfiniteRest && (
              <>
                <TouchableOpacity style={styles.restAdjustButton} onPress={() => adjustRestTimer(-15)}>
                  <Text style={styles.restAdjustText}>-15s</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.restAdjustButton} onPress={() => adjustRestTimer(15)}>
                  <Text style={styles.restAdjustText}>+15s</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          {/* Bottom Controls */}
          <View style={styles.restBottomControls}>
            <TouchableOpacity style={styles.skipRestButton} onPress={skipRest}>
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.infinityButton} onPress={toggleInfiniteRest}>
              <Text style={styles.infinitySymbol}>∞</Text>
              <Text style={styles.infinityText}>
                {isInfiniteRest ? 'End Rest' : 'Infinite'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Current Exercise */}
      <ScrollView style={styles.content}>
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{currentExercise.exerciseName}</Text>
          <Text style={styles.setInfo}>{currentSetText}</Text>
          
          {/* Previous Sets */}
          {currentSets.length > 0 && (
            <View style={styles.previousSets}>
              <Text style={styles.previousSetsTitle}>Previous Sets:</Text>
              {currentSets.map((set, index) => (
                <View key={index} style={styles.previousSet}>
                  <Text style={styles.previousSetText}>
                    Set {index + 1}: {set.weight}kg × {set.reps} reps
                  </Text>
                  <Ionicons name="checkmark-circle" size={20} color="#38a169" />
                </View>
              ))}
            </View>
          )}

          {!isResting && (
            <>
              {/* Weight Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity style={styles.adjustButton} onPress={() => adjustWeight(-2.5)}>
                    <Text style={styles.adjustButtonText}>-2.5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.weightDisplay} onPress={() => setShowWeightModal(true)}>
                    <Text style={styles.weightText}>{tempWeight}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustButton} onPress={() => adjustWeight(2.5)}>
                    <Text style={styles.adjustButtonText}>+2.5</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reps Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Reps</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity style={styles.adjustButton} onPress={() => adjustReps(-1)}>
                    <Text style={styles.adjustButtonText}>-1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.repsDisplay} onPress={() => setShowRepsModal(true)}>
                    <Text style={styles.repsText}>{tempReps}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustButton} onPress={() => adjustReps(1)}>
                    <Text style={styles.adjustButtonText}>+1</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Log Set Button */}
              <TouchableOpacity style={styles.logSetButton} onPress={logSet}>
                <Text style={styles.logSetButtonText}>Log Set</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]} 
          onPress={moveToPreviousExercise}
          disabled={currentExerciseIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentExerciseIndex === 0 ? "#cbd5e0" : "#3182ce"} />
          <Text style={[styles.navButtonText, currentExerciseIndex === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={moveToNextExercise}>
          <Text style={styles.navButtonText}>
            {currentExerciseIndex === routine.exercises.length - 1 ? 'Finish' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#3182ce" />
        </TouchableOpacity>
      </View>

      {/* Weight Modal */}
      <Modal visible={showWeightModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Weight (kg)</Text>
            <TextInput
              style={styles.modalInput}
              value={tempWeight}
              onChangeText={setTempWeight}
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowWeightModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={() => setShowWeightModal(false)}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reps Modal */}
      <Modal visible={showRepsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Reps</Text>
            <TextInput
              style={styles.modalInput}
              value={tempReps}
              onChangeText={setTempReps}
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowRepsModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={() => setShowRepsModal(false)}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerCenter: {
    alignItems: 'center',
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  progressText: {
    fontSize: 14,
    color: '#4a5568',
    marginTop: 2,
  },
  finishButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3182ce',
  },
  restContainer: {
    backgroundColor: '#ff8c00',
    padding: 20,
    alignItems: 'center',
  },
  restTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  skipRestButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipRestText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  restControls: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  restAdjustButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  restAdjustText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  restBottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infinityButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  infinitySymbol: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infinityText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'center',
    marginBottom: 8,
  },
  setInfo: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 24,
  },
  previousSets: {
    marginBottom: 24,
  },
  previousSetsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 12,
  },
  previousSet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    marginBottom: 4,
  },
  previousSetText: {
    fontSize: 14,
    color: '#4a5568',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'center',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButton: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  weightDisplay: {
    backgroundColor: '#3182ce',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  weightText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  repsDisplay: {
    backgroundColor: '#38a169',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  repsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logSetButton: {
    backgroundColor: '#3182ce',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  logSetButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3182ce',
    marginHorizontal: 8,
  },
  navButtonTextDisabled: {
    color: '#cbd5e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancel: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#4a5568',
  },
  modalConfirm: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#3182ce',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default ActiveWorkoutScreen; 