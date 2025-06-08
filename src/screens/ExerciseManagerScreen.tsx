import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Exercise, RootStackParamList } from '../types';
import { storageService } from '../services/storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'ExerciseManager'>;
  route: RouteProp<RootStackParamList, 'ExerciseManager'>;
}

const EXERCISE_CATEGORIES = [
  { key: 'all', label: 'All Categories', icon: 'fitness' as const },
  { key: 'chest', label: 'Chest', icon: 'body' as const },
  { key: 'back', label: 'Back', icon: 'body-outline' as const },
  { key: 'legs', label: 'Legs', icon: 'walk' as const },
  { key: 'shoulders', label: 'Shoulders', icon: 'triangle' as const },
  { key: 'arms', label: 'Arms', icon: 'barbell' as const },
  { key: 'core', label: 'Core', icon: 'ellipse' as const },
  { key: 'cardio', label: 'Cardio', icon: 'heart' as const },
];

const EQUIPMENT_OPTIONS = [
  'barbell',
  'dumbbells',
  'bodyweight',
  'pull-up bar',
  'bench',
  'machine',
  'cables',
  'resistance bands',
  'kettlebell',
  'squat rack',
];

const DIFFICULTY_LEVELS = [
  { key: 'beginner', label: 'Beginner', color: '#4CAF50' },
  { key: 'intermediate', label: 'Intermediate', color: '#FF9800' },
  { key: 'advanced', label: 'Advanced', color: '#F44336' },
];

export default function ExerciseManagerScreen({ navigation, route }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEquipmentFilter, setShowEquipmentFilter] = useState(false);

  // Create/Edit Exercise Form State
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState<Exercise['category']>('chest');
  const [exerciseMuscleGroups, setExerciseMuscleGroups] = useState('');
  const [exerciseInstructions, setExerciseInstructions] = useState('');
  const [exerciseDifficulty, setExerciseDifficulty] = useState<Exercise['difficulty']>('beginner');
  const [exerciseEquipment, setExerciseEquipment] = useState<string[]>([]);
  const [isEditingExercise, setIsEditingExercise] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const editingExercise = route.params?.editingExercise;
  const fromRoutineBuilder = route.params?.fromRoutineBuilder;
  const routineBuilderCallback = route.params?.routineBuilderCallback;

  useEffect(() => {
    loadData();
    
    // Handle editing exercise from navigation params
    if (editingExercise) {
      openEditExercise(editingExercise);
    }
  }, []);

  const loadData = async () => {
    try {
      if (__DEV__) console.log('🏋️ ExerciseManager - Loading exercises...');
      const allExercises = await storageService.getAllExercises();
      setExercises(allExercises);
    } catch (error) {
      console.error('❌ ExerciseManager - Error loading exercises:', error);
      Alert.alert('Error', 'Failed to load exercises. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Optimized filtering with useMemo to prevent redundant calculations
  const filteredExercises = useMemo(() => {
    try {
      let filtered = [...exercises];
      
      // Apply search filter
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase();
        filtered = filtered.filter(({ name = '', category = '', muscleGroups = [] }) => {
          const lowerName = name.toLowerCase();
          const lowerCategory = category.toLowerCase();
          return (
            lowerName.includes(searchTerm) ||
            lowerCategory.includes(searchTerm) ||
            muscleGroups.some(muscle => muscle?.toLowerCase()?.includes(searchTerm))
          );
        });
      }
      
      // Apply category filter
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(ex => ex.category === selectedCategory);
      }
      
      // Apply equipment filter
      if (selectedEquipment.length > 0) {
        filtered = filtered.filter(({ equipmentNeeded = [] }) => 
          selectedEquipment.some(eq => equipmentNeeded.map(e => e.toLowerCase()).includes(eq.toLowerCase())) ||
          (selectedEquipment.includes('bodyweight') && equipmentNeeded.length === 0)
        );
      }
      
      // Sort by popularity (custom exercises at bottom)
      filtered.sort((a, b) => {
        if (a.isCustom && !b.isCustom) return 1;
        if (!a.isCustom && b.isCustom) return -1;
        return (b.popularity || 0) - (a.popularity || 0);
      });
      
      return filtered;
    } catch (error) {
      console.error('❌ ExerciseManager - Error filtering exercises:', error);
      return exercises;
    }
  }, [exercises, searchQuery, selectedCategory, selectedEquipment]);

  const openCreateExercise = () => {
    resetForm();
    setIsEditingExercise(false);
    setShowCreateModal(true);
  };

  const openEditExercise = (exercise: Exercise) => {
    setExerciseName(exercise.name);
    setExerciseCategory(exercise.category);
    setExerciseMuscleGroups(exercise.muscleGroups.join(', '));
    setExerciseInstructions(exercise.instructions);
    setExerciseDifficulty(exercise.difficulty);
    setExerciseEquipment([...exercise.equipmentNeeded]);
    setIsEditingExercise(true);
    setEditingExerciseId(exercise.id);
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setExerciseName('');
    setExerciseCategory('chest');
    setExerciseMuscleGroups('');
    setExerciseInstructions('');
    setExerciseDifficulty('beginner');
    setExerciseEquipment([]);
    setEditingExerciseId(null);
  };

  const saveExercise = async () => {
    if (!exerciseName.trim()) {
      Alert.alert('Validation Error', 'Please enter an exercise name.');
      return;
    }

    if (!exerciseInstructions.trim()) {
      Alert.alert('Validation Error', 'Please enter exercise instructions.');
      return;
    }

    if (!exerciseMuscleGroups.trim()) {
      Alert.alert('Validation Error', 'Please enter muscle groups.');
      return;
    }

    // Add duplicate name validation
    const trimmedName = exerciseName.trim().toLowerCase();
    const existingExercise = exercises.find(e => 
      e.name.toLowerCase() === trimmedName && 
      (!isEditingExercise || e.id !== editingExerciseId)
    );
    
    if (existingExercise) {
      Alert.alert(
        'Duplicate Exercise', 
        `An exercise named "${exerciseName.trim()}" already exists. Please choose a different name.`
      );
      return;
    }

    setSaving(true);
    try {
      if (__DEV__) console.log('🏋️ ExerciseManager - Saving exercise:', exerciseName);
      
      const muscleGroups = exerciseMuscleGroups.split(',').map(mg => mg.trim()).filter(mg => mg);
      
      const exercise: Exercise = {
        id: isEditingExercise ? editingExerciseId! : `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: exerciseName.trim(),
        category: exerciseCategory,
        muscleGroups,
        instructions: exerciseInstructions.trim(),
        difficulty: exerciseDifficulty,
        equipmentNeeded: [...exerciseEquipment],
        popularity: 50, // Default popularity for custom exercises
        isCustom: true,
        createdAt: isEditingExercise ? exercises.find(e => e.id === editingExerciseId)?.createdAt : new Date(),
        createdBy: 'user-default', // TODO: Use actual user ID
        usageCount: isEditingExercise ? exercises.find(e => e.id === editingExerciseId)?.usageCount || 0 : 0,
        lastUsed: isEditingExercise ? exercises.find(e => e.id === editingExerciseId)?.lastUsed : undefined,
      };

      await storageService.saveExercise(exercise);
      
      if (__DEV__) console.log('✅ ExerciseManager - Exercise saved successfully');
      Alert.alert(
        'Success', 
        `Exercise "${exerciseName}" ${isEditingExercise ? 'updated' : 'created'} successfully!`,
        [{ text: 'OK', onPress: () => {
          setShowCreateModal(false);
          resetForm();
          loadData();
        }}]
      );
    } catch (error) {
      console.error('❌ ExerciseManager - Error saving exercise:', error);
      Alert.alert('Error', 'Failed to save exercise. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteExercise = (exercise: Exercise) => {
    if (!exercise.isCustom) {
      Alert.alert('Cannot Delete', 'Default exercises cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (__DEV__) console.log('🗑️ ExerciseManager - Deleting exercise:', exercise.name);
              await storageService.deleteExercise(exercise.id);
              loadData();
              Alert.alert('Success', `Exercise "${exercise.name}" deleted successfully.`);
            } catch (error) {
              console.error('❌ ExerciseManager - Error deleting exercise:', error);
              Alert.alert('Error', 'Failed to delete exercise. Please try again.');
            }
          }
        }
      ]
    );
  };

  const toggleEquipmentSelection = (equipment: string) => {
    if (exerciseEquipment.includes(equipment)) {
      setExerciseEquipment(exerciseEquipment.filter(eq => eq !== equipment));
    } else {
      setExerciseEquipment([...exerciseEquipment, equipment]);
    }
  };

  const toggleEquipmentFilter = (equipment: string) => {
    if (selectedEquipment.includes(equipment)) {
      setSelectedEquipment(selectedEquipment.filter(eq => eq !== equipment));
    } else {
      setSelectedEquipment([...selectedEquipment, equipment]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedEquipment([]);
    setShowFilters(false);
  };

  // Add exercise selection handler
  const handleExerciseSelect = (exercise: Exercise) => {
    if (fromRoutineBuilder && routineBuilderCallback === 'addExercise') {
      // Navigate back with selected exercise data
      navigation.navigate('RoutineBuilder', { selectedExercise: exercise });
    }
    // If not from routine builder, do nothing (just browse mode)
  };

  const renderExerciseCard = ({ item: exercise }: { item: Exercise }) => (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={() => handleExerciseSelect(exercise)}
      activeOpacity={fromRoutineBuilder ? 0.7 : 1}
      accessibilityLabel={fromRoutineBuilder ? `Select ${exercise.name}` : `View ${exercise.name} details`}
      accessibilityRole="button"
    >
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <View style={styles.exerciseNameRow}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.isCustom && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>Custom</Text>
              </View>
            )}
          </View>
          <Text style={styles.exerciseCategory}>
            {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)} • {exercise.difficulty}
          </Text>
          <Text style={styles.exerciseMuscles}>
            {exercise.muscleGroups.join(', ')}
          </Text>
        </View>
        <View style={styles.exerciseActions}>
          {exercise.isCustom && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  openEditExercise(exercise);
                }}
                accessibilityLabel={`Edit ${exercise.name}`}
                accessibilityRole="button"
              >
                <Ionicons name="pencil" size={20} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  deleteExercise(exercise);
                }}
                accessibilityLabel={`Delete ${exercise.name}`}
                accessibilityRole="button"
              >
                <Ionicons name="trash" size={20} color="#F44336" />
              </TouchableOpacity>
            </>
          )}
          {fromRoutineBuilder && (
            <View style={styles.selectIndicator}>
              <Ionicons name="add-circle" size={24} color="#4CAF50" />
            </View>
          )}
        </View>
      </View>
      
      {exercise.equipmentNeeded.length > 0 && (
        <View style={styles.equipmentContainer}>
          <Text style={styles.equipmentLabel}>Equipment: </Text>
          <Text style={styles.equipmentText}>
            {exercise.equipmentNeeded.join(', ')}
          </Text>
        </View>
      )}
      
      <Text style={styles.exerciseInstructions} numberOfLines={2}>
        {exercise.instructions}
      </Text>
      
      {exercise.usageCount && exercise.usageCount > 0 && (
        <Text style={styles.usageInfo}>
          Used {exercise.usageCount} time{exercise.usageCount !== 1 ? 's' : ''}
          {exercise.lastUsed && ` • Last used ${new Date(exercise.lastUsed).toLocaleDateString()}`}
        </Text>
      )}
    </TouchableOpacity>
  );

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {fromRoutineBuilder ? 'Select Exercise' : 'Exercise Library'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreateExercise}
          accessibilityLabel="Create new exercise"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchAndFiltersContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search exercises"
              accessibilityHint="Enter text to search for exercises by name, category, or muscle group"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                accessibilityLabel="Clear search"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
            accessibilityLabel="Toggle filters"
            accessibilityRole="button"
          >
            <Ionicons name="funnel" size={20} color={showFilters ? "#4CAF50" : "#666"} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filters</Text>
            
            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
              {EXERCISE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.key && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.key)}
                  accessibilityLabel={`Filter by ${category.label}`}
                  accessibilityRole="button"
                >
                  <Ionicons 
                    name={category.icon} 
                    size={16} 
                    color={selectedCategory === category.key ? "#FFF" : "#666"} 
                  />
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category.key && styles.categoryChipTextSelected,
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Equipment Filter */}
            <TouchableOpacity
              style={styles.equipmentFilterToggle}
              onPress={() => setShowEquipmentFilter(!showEquipmentFilter)}
              accessibilityLabel="Toggle equipment filter"
              accessibilityRole="button"
            >
              <Text style={styles.equipmentFilterText}>
                Equipment {selectedEquipment.length > 0 && `(${selectedEquipment.length})`}
              </Text>
              <Ionicons 
                name={showEquipmentFilter ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>

            {showEquipmentFilter && (
              <View style={styles.equipmentOptions}>
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <TouchableOpacity
                    key={equipment}
                    style={[
                      styles.equipmentChip,
                      selectedEquipment.includes(equipment) && styles.equipmentChipSelected,
                    ]}
                    onPress={() => toggleEquipmentFilter(equipment)}
                    accessibilityLabel={`Filter by ${equipment}`}
                    accessibilityRole="button"
                  >
                    <Text style={[
                      styles.equipmentChipText,
                      selectedEquipment.includes(equipment) && styles.equipmentChipTextSelected,
                    ]}>
                      {equipment}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Clear Filters */}
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}
              accessibilityLabel="Clear all filters"
              accessibilityRole="button"
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Exercise List */}
      <View style={styles.exerciseListContainer}>
        <Text style={styles.exerciseCount}>
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
          {fromRoutineBuilder && ' • Tap to select'}
        </Text>
        
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.exerciseList}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="barbell-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No exercises found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory !== 'all' || selectedEquipment.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Add your first custom exercise!'}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Create/Edit Exercise Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCreateModal(false)}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isEditingExercise ? 'Edit Exercise' : 'Create Exercise'}
            </Text>
            <TouchableOpacity
              style={[styles.modalSaveButton, saving && styles.modalSaveButtonDisabled]}
              onPress={saveExercise}
              disabled={saving}
              accessibilityLabel={isEditingExercise ? "Update exercise" : "Create exercise"}
              accessibilityRole="button"
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalSaveButtonText}>
                  {isEditingExercise ? 'Update' : 'Create'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            {/* Exercise Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Exercise Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter exercise name"
                value={exerciseName}
                onChangeText={setExerciseName}
                accessibilityLabel="Exercise name"
                accessibilityHint="Enter the name of the exercise"
              />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                {EXERCISE_CATEGORIES.slice(1).map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryOption,
                      exerciseCategory === category.key && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setExerciseCategory(category.key as Exercise['category'])}
                    accessibilityLabel={`Select ${category.label} category`}
                    accessibilityRole="button"
                  >
                    <Ionicons 
                      name={category.icon} 
                      size={16} 
                      color={exerciseCategory === category.key ? "#FFF" : "#666"} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      exerciseCategory === category.key && styles.categoryOptionTextSelected,
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Muscle Groups */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Muscle Groups *</Text>
              <Text style={styles.formHint}>Separate multiple muscle groups with commas</Text>
              <TextInput
                style={[styles.formInput, styles.formInputMultiline]}
                placeholder="e.g., chest, triceps, front delts"
                value={exerciseMuscleGroups}
                onChangeText={setExerciseMuscleGroups}
                multiline
                numberOfLines={2}
                accessibilityLabel="Muscle groups"
                accessibilityHint="Enter the muscle groups worked by this exercise"
              />
            </View>

            {/* Difficulty */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Difficulty *</Text>
              <View style={styles.difficultyPicker}>
                {DIFFICULTY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.key}
                    style={[
                      styles.difficultyOption,
                      exerciseDifficulty === level.key && { backgroundColor: level.color },
                    ]}
                    onPress={() => setExerciseDifficulty(level.key as Exercise['difficulty'])}
                    accessibilityLabel={`Select ${level.label} difficulty`}
                    accessibilityRole="button"
                  >
                    <Text style={[
                      styles.difficultyOptionText,
                      exerciseDifficulty === level.key && styles.difficultyOptionTextSelected,
                    ]}>
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Equipment */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Equipment Needed</Text>
              <Text style={styles.formHint}>Select all equipment needed for this exercise</Text>
              <View style={styles.equipmentPicker}>
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <TouchableOpacity
                    key={equipment}
                    style={[
                      styles.equipmentOption,
                      exerciseEquipment.includes(equipment) && styles.equipmentOptionSelected,
                    ]}
                    onPress={() => toggleEquipmentSelection(equipment)}
                    accessibilityLabel={`${exerciseEquipment.includes(equipment) ? 'Deselect' : 'Select'} ${equipment}`}
                    accessibilityRole="button"
                  >
                    <Text style={[
                      styles.equipmentOptionText,
                      exerciseEquipment.includes(equipment) && styles.equipmentOptionTextSelected,
                    ]}>
                      {equipment}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Instructions *</Text>
              <Text style={styles.formHint}>Provide clear step-by-step instructions for proper form</Text>
              <TextInput
                style={[styles.formInput, styles.formInputLarge]}
                placeholder="Enter detailed exercise instructions..."
                value={exerciseInstructions}
                onChangeText={setExerciseInstructions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Exercise instructions"
                accessibilityHint="Enter detailed instructions for performing this exercise"
              />
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 5, // Further reduced gap between header and content
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    padding: 8,
  },
  searchAndFiltersContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: '#4CAF50',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  categoryChipTextSelected: {
    color: '#FFF',
  },
  equipmentFilterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  equipmentFilterText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  equipmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  equipmentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
  },
  equipmentChipSelected: {
    backgroundColor: '#4CAF50',
  },
  equipmentChipText: {
    fontSize: 12,
    color: '#666',
  },
  equipmentChipTextSelected: {
    color: '#FFF',
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  exerciseListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  exerciseList: {
    paddingBottom: 20,
  },

  selectIndicator: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  exerciseCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  customBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  customBadgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  exerciseMuscles: {
    fontSize: 14,
    color: '#888',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  equipmentText: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  exerciseInstructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  usageInfo: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalSaveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#CCC',
  },
  modalSaveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  formInputMultiline: {
    height: 60,
    textAlignVertical: 'top',
  },
  formInputLarge: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    marginTop: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  categoryOptionSelected: {
    backgroundColor: '#4CAF50',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  categoryOptionTextSelected: {
    color: '#FFF',
  },
  difficultyPicker: {
    flexDirection: 'row',
    marginTop: 8,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  difficultyOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  difficultyOptionTextSelected: {
    color: '#FFF',
  },
  equipmentPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  equipmentOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
  },
  equipmentOptionSelected: {
    backgroundColor: '#4CAF50',
  },
  equipmentOptionText: {
    fontSize: 14,
    color: '#666',
  },
  equipmentOptionTextSelected: {
    color: '#FFF',
  },
  bottomSpacing: {
    height: 80,
  },
}); 