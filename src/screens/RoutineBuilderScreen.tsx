import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Exercise, RoutineExercise, WorkoutRoutine } from '../types';
import { storageService } from '../services/storage';

interface Props {
  navigation: any;
  route: {
    params?: {
      editingRoutine?: WorkoutRoutine;
      selectedExercise?: Exercise;
    };
  };
}

export default function RoutineBuilderScreen({ navigation, route }: Props) {
  const [routineName, setRoutineName] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const editingRoutine = route.params?.editingRoutine;
  const selectedExercise = route.params?.selectedExercise;
  const isEditing = !!editingRoutine;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Handle exercise selection from ExerciseManager
    if (selectedExercise) {
      addExercise(selectedExercise);
      // Clear the parameter to prevent re-adding on re-renders
      navigation.setParams({ selectedExercise: undefined });
    }
  }, [selectedExercise]);

  const loadData = async () => {
    try {
      console.log('🔍 Loading routine builder data...');
      const exercises = await storageService.getPopularExercises(30);
      setAvailableExercises(exercises);

      if (isEditing && editingRoutine) {
        console.log('✏️ Loading routine for editing:', editingRoutine.name);
        setRoutineName(editingRoutine.name);
        setRoutineDescription(editingRoutine.description || '');
        setSelectedExercises([...editingRoutine.exercises]);
      }
    } catch (error) {
      console.error('❌ Error loading routine builder data:', error);
      Alert.alert('Error', 'Failed to load exercises. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addExercise = (exercise: Exercise) => {
    console.log('➕ Adding exercise:', exercise.name);
    const newRoutineExercise: RoutineExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      plannedSets: 3,
      plannedReps: 10,
      plannedWeight: undefined,
      restTime: 90, // Default 90 seconds
      order: selectedExercises.length + 1,
    };

    setSelectedExercises([...selectedExercises, newRoutineExercise]);
    
    // Sprint 2.2: Track exercise usage for analytics
    storageService.updateExerciseUsage(exercise.id).catch(error => {
      if (__DEV__) console.warn('⚠️ Failed to update exercise usage:', error);
    });
  };

  const removeExercise = (index: number) => {
    console.log('➖ Removing exercise at index:', index);
    const updatedExercises = selectedExercises.filter((_, i) => i !== index);
    // Reorder remaining exercises
    const reorderedExercises = updatedExercises.map((exercise, i) => ({
      ...exercise,
      order: i + 1,
    }));
    setSelectedExercises(reorderedExercises);
  };

  const updateExercise = (index: number, field: keyof RoutineExercise, value: any) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setSelectedExercises(updatedExercises);
  };

  const moveExercise = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= selectedExercises.length) return;

    console.log(`🔄 Moving exercise from ${fromIndex} to ${toIndex}`);
    const updatedExercises = [...selectedExercises];
    [updatedExercises[fromIndex], updatedExercises[toIndex]] = 
    [updatedExercises[toIndex], updatedExercises[fromIndex]];
    
    // Update order numbers
    updatedExercises.forEach((exercise, i) => {
      exercise.order = i + 1;
    });
    
    setSelectedExercises(updatedExercises);
  };

  const calculateEstimatedDuration = () => {
    const exerciseTime = selectedExercises.reduce((total, exercise) => {
      // Assume 45 seconds per set + rest time
      return total + (exercise.plannedSets * (45 + exercise.restTime));
    }, 0);
    return Math.round(exerciseTime / 60); // Convert to minutes
  };

  const saveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert('Validation Error', 'Please enter a routine name.');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one exercise.');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Saving routine:', routineName);
      
      const routine: WorkoutRoutine = {
        id: isEditing ? editingRoutine.id : `routine_${Date.now()}`,
        name: routineName.trim(),
        description: routineDescription.trim(),
        exercises: selectedExercises,
        difficulty: 'intermediate', // Will be smart-calculated later
        estimatedDuration: calculateEstimatedDuration(),
        muscleGroups: [...new Set(selectedExercises.map(e => {
          const exercise = availableExercises.find(ae => ae.id === e.exerciseId);
          return exercise?.category || 'unknown';
        }))],
        createdAt: isEditing ? editingRoutine.createdAt : new Date(),
        lastUsed: isEditing ? editingRoutine.lastUsed : undefined,
        isCustom: true,
      };

      await storageService.saveRoutine(routine);
      
      console.log('✅ Routine saved successfully');
      Alert.alert(
        'Success', 
        `Routine "${routineName}" ${isEditing ? 'updated' : 'created'} successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('❌ Error saving routine:', error);
      Alert.alert('Error', 'Failed to save routine. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Edit Routine' : 'Create Routine'}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveRoutine}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Routine Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Routine Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              value={routineName}
              onChangeText={setRoutineName}
              placeholder="e.g., Upper Body Power"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={routineDescription}
              onChangeText={setRoutineDescription}
              placeholder="Brief description of this routine..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.routineStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{selectedExercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{calculateEstimatedDuration()}</Text>
              <Text style={styles.statLabel}>Min Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {selectedExercises.reduce((total, ex) => total + ex.plannedSets, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Sets</Text>
            </View>
          </View>
        </View>

        {/* Exercises Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                // Set callback function using navigation.setOptions to avoid serialization warning
                navigation.navigate('ExerciseManager', {
                  fromRoutineBuilder: true,
                  routineBuilderCallback: 'addExercise'
                });
              }}
            >
              <Ionicons name="add" size={20} color="#4CAF50" />
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="fitness" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No exercises added yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap "Add Exercise" to get started
              </Text>
            </View>
          ) : (
            selectedExercises.map((exercise, index) => (
              <View key={`${exercise.exerciseId}_${index}`} style={styles.exerciseItem}>
                {/* Exercise Header */}
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                    <Text style={styles.exerciseOrder}>Exercise {exercise.order}</Text>
                  </View>
                  
                  <View style={styles.exerciseActions}>
                    {/* Move buttons */}
                    <TouchableOpacity
                      style={[styles.actionButton, index === 0 && styles.actionButtonDisabled]}
                      onPress={() => moveExercise(index, 'up')}
                      disabled={index === 0}
                    >
                      <Ionicons name="chevron-up" size={16} color={index === 0 ? "#ccc" : "#666"} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, index === selectedExercises.length - 1 && styles.actionButtonDisabled]}
                      onPress={() => moveExercise(index, 'down')}
                      disabled={index === selectedExercises.length - 1}
                    >
                      <Ionicons name="chevron-down" size={16} color={index === selectedExercises.length - 1 ? "#ccc" : "#666"} />
                    </TouchableOpacity>
                    
                    {/* Delete button */}
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => removeExercise(index)}
                    >
                      <Ionicons name="trash" size={16} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Exercise Configuration */}
                <View style={styles.exerciseConfig}>
                  <View style={styles.configRow}>
                    <View style={styles.configItem}>
                      <Text style={styles.configLabel}>Sets</Text>
                      <TextInput
                        style={styles.configInput}
                        value={exercise.plannedSets.toString()}
                        onChangeText={(text) => {
                          const value = parseInt(text) || 1;
                          updateExercise(index, 'plannedSets', Math.max(1, value));
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.configItem}>
                      <Text style={styles.configLabel}>Reps</Text>
                      <TextInput
                        style={styles.configInput}
                        value={exercise.plannedReps.toString()}
                        onChangeText={(text) => {
                          const value = parseInt(text) || 1;
                          updateExercise(index, 'plannedReps', Math.max(1, value));
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.configItem}>
                      <Text style={styles.configLabel}>Weight (kg)</Text>
                      <TextInput
                        style={styles.configInput}
                        value={exercise.plannedWeight?.toString() || ''}
                        onChangeText={(text) => {
                          const value = text ? parseFloat(text) : undefined;
                          updateExercise(index, 'plannedWeight', value);
                        }}
                        placeholder="Optional"
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.configItem}>
                      <Text style={styles.configLabel}>Rest (s)</Text>
                      <TextInput
                        style={styles.configInput}
                        value={exercise.restTime.toString()}
                        onChangeText={(text) => {
                          const value = parseInt(text) || 30;
                          updateExercise(index, 'restTime', Math.max(30, value));
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  routineStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  addButtonText: {
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  exerciseItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  exerciseOrder: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  actionButtonDisabled: {
    opacity: 0.3,
  },
  deleteButton: {
    marginLeft: 8,
  },
  exerciseConfig: {
    padding: 16,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  configItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  configLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  configInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    height: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageExercisesButton: {
    padding: 8,
  },
  manageExercisesText: {
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  modalCloseButton: {
    padding: 12,
  },
  modalBody: {
    flex: 1,
    paddingBottom: 20,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    minHeight: 100,
    backgroundColor: 'white',
  },
  exerciseOptionInfo: {
    flex: 1,
    paddingRight: 16,
  },
  exerciseOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseOptionName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  exerciseOptionCategory: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  exerciseOptionMuscles: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  exerciseOptionMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  popularityText: {
    fontSize: 10,
    color: '#999',
  },
  customExerciseBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  customExerciseBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  difficultyBeginner: {
    backgroundColor: '#4CAF50',
  },
  difficultyIntermediate: {
    backgroundColor: '#FF9800',
  },
  difficultyAdvanced: {
    backgroundColor: '#F44336',
  },
  exerciseOptionEquipment: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  createExerciseButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  createExerciseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 