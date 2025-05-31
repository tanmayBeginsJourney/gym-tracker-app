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
import { WorkoutRoutine, RoutineBundle, DayOfWeek } from '../types';
import { storageService } from '../services/storage';

interface Props {
  navigation: any;
  route: {
    params?: {
      editingBundle?: RoutineBundle;
    };
  };
}

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export default function BundleManagerScreen({ navigation, route }: Props) {
  const [bundleName, setBundleName] = useState('');
  const [bundleDescription, setBundleDescription] = useState('');
  const [routineSchedule, setRoutineSchedule] = useState<{ [key in DayOfWeek]: string | null }>({
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  });
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [availableRoutines, setAvailableRoutines] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRoutineSelector, setShowRoutineSelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  const editingBundle = route.params?.editingBundle;
  const isEditing = !!editingBundle;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔍 Loading bundle manager data...');
      const routines = await storageService.getAllRoutines();
      setAvailableRoutines(routines);

      if (isEditing && editingBundle) {
        console.log('✏️ Loading bundle for editing:', editingBundle.name);
        setBundleName(editingBundle.name);
        setBundleDescription(editingBundle.description || '');
        setRoutineSchedule({ ...editingBundle.routineSchedule });
        setSetAsDefault(editingBundle.isDefault);
      }
    } catch (error) {
      console.error('❌ Error loading bundle manager data:', error);
      Alert.alert('Error', 'Failed to load routines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectRoutineForDay = (day: DayOfWeek) => {
    console.log('📅 Selecting routine for day:', day);
    setSelectedDay(day);
    setShowRoutineSelector(true);
  };

  const assignRoutine = (routineId: string | null) => {
    if (!selectedDay) return;
    
    console.log('🎯 Assigning routine to day:', selectedDay, routineId);
    setRoutineSchedule(prev => ({
      ...prev,
      [selectedDay]: routineId,
    }));
    setShowRoutineSelector(false);
    setSelectedDay(null);
  };

  const getRoutineName = (routineId: string | null) => {
    if (!routineId) return 'Rest Day';
    const routine = availableRoutines.find(r => r.id === routineId);
    return routine?.name || 'Unknown Routine';
  };

  const getScheduleStats = () => {
    const workoutDays = Object.values(routineSchedule).filter(id => id !== null).length;
    const restDays = 7 - workoutDays;
    const totalEstimatedTime = Object.values(routineSchedule).reduce((total, routineId) => {
      if (!routineId) return total;
      const routine = availableRoutines.find(r => r.id === routineId);
      return total + (routine?.estimatedDuration || 0);
    }, 0);

    return { workoutDays, restDays, totalEstimatedTime };
  };

  const saveBundle = async () => {
    if (!bundleName.trim()) {
      Alert.alert('Validation Error', 'Please enter a bundle name.');
      return;
    }

    const hasAtLeastOneWorkout = Object.values(routineSchedule).some(id => id !== null);
    if (!hasAtLeastOneWorkout) {
      Alert.alert('Validation Error', 'Please assign at least one routine to the schedule.');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Saving bundle:', bundleName);

      const bundle: RoutineBundle = {
        id: isEditing ? editingBundle.id : `bundle_${Date.now()}`,
        name: bundleName.trim(),
        description: bundleDescription.trim(),
        routineSchedule,
        isDefault: setAsDefault,
        createdAt: isEditing ? editingBundle.createdAt : new Date(),
        lastModified: new Date(),
      };

      await storageService.saveRoutineBundle(bundle);

      console.log('✅ Bundle saved successfully');
      Alert.alert(
        'Success',
        `Bundle "${bundleName}" ${isEditing ? 'updated' : 'created'} successfully!${setAsDefault ? ' Set as default schedule.' : ''}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('❌ Error saving bundle:', error);
      Alert.alert('Error', 'Failed to save bundle. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading routines...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getScheduleStats();

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
          {isEditing ? 'Edit Bundle' : 'Create Bundle'}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveBundle}
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
        {/* Bundle Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bundle Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              value={bundleName}
              onChangeText={setBundleName}
              placeholder="e.g., 5-Day Power Split"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={bundleDescription}
              onChangeText={setBundleDescription}
              placeholder="Brief description of this workout schedule..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={styles.defaultToggle}
            onPress={() => setSetAsDefault(!setAsDefault)}
          >
            <View style={styles.defaultToggleInfo}>
              <Text style={styles.defaultToggleTitle}>Set as Default Schedule</Text>
              <Text style={styles.defaultToggleSubtitle}>
                Use this bundle to suggest today's workouts
              </Text>
            </View>
            <View style={[styles.checkbox, setAsDefault && styles.checkboxChecked]}>
              {setAsDefault && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
          </TouchableOpacity>

          <View style={styles.bundleStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.workoutDays}</Text>
              <Text style={styles.statLabel}>Workout Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.restDays}</Text>
              <Text style={styles.statLabel}>Rest Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(stats.totalEstimatedTime / 60 * 10) / 10}</Text>
              <Text style={styles.statLabel}>Hours/Week</Text>
            </View>
          </View>
        </View>

        {/* Weekly Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          <Text style={styles.sectionSubtitle}>
            Assign routines to each day of the week. Leave empty for rest days.
          </Text>

          {DAYS_OF_WEEK.map((day) => (
            <TouchableOpacity
              key={day.key}
              style={styles.dayItem}
              onPress={() => selectRoutineForDay(day.key)}
            >
              <View style={styles.dayInfo}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Text style={styles.dayRoutine}>
                  {getRoutineName(routineSchedule[day.key])}
                </Text>
              </View>
              
              <View style={styles.dayActions}>
                {routineSchedule[day.key] && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => assignRoutine(null)}
                    onPressIn={() => setSelectedDay(day.key)}
                  >
                    <Ionicons name="close-circle" size={20} color="#f44336" />
                  </TouchableOpacity>
                )}
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Preview</Text>
          
          <View style={styles.schedulePreview}>
            {DAYS_OF_WEEK.map((day) => {
              const routineId = routineSchedule[day.key];
              const routine = routineId ? availableRoutines.find(r => r.id === routineId) : null;
              const isRestDay = !routineId;

              return (
                <View key={day.key} style={styles.previewDay}>
                  <Text style={styles.previewDayLabel}>{day.short}</Text>
                  <View style={[
                    styles.previewDayContent,
                    isRestDay && styles.previewRestDay
                  ]}>
                    {isRestDay ? (
                      <Text style={styles.previewRestText}>Rest</Text>
                    ) : (
                      <>
                        <Text style={styles.previewRoutineName} numberOfLines={2}>
                          {routine?.name || 'Unknown'}
                        </Text>
                        <Text style={styles.previewDuration}>
                          {routine?.estimatedDuration || 0}min
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Routine Selector Modal */}
      {showRoutineSelector && selectedDay && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Routine for {DAYS_OF_WEEK.find(d => d.key === selectedDay)?.label}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowRoutineSelector(false);
                  setSelectedDay(null);
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Rest Day Option */}
              <TouchableOpacity
                style={styles.routineOption}
                onPress={() => assignRoutine(null)}
              >
                <View style={styles.routineOptionInfo}>
                  <Text style={styles.routineOptionName}>Rest Day</Text>
                  <Text style={styles.routineOptionDescription}>
                    No workout scheduled - recovery day
                  </Text>
                </View>
                <View style={styles.restDayIcon}>
                  <Ionicons name="bed" size={24} color="#666" />
                </View>
              </TouchableOpacity>

              {/* Available Routines */}
              {availableRoutines.map((routine) => (
                <TouchableOpacity
                  key={routine.id}
                  style={[
                    styles.routineOption,
                    routineSchedule[selectedDay] === routine.id && styles.routineOptionSelected
                  ]}
                  onPress={() => assignRoutine(routine.id)}
                >
                  <View style={styles.routineOptionInfo}>
                    <Text style={styles.routineOptionName}>{routine.name}</Text>
                    <Text style={styles.routineOptionDescription} numberOfLines={2}>
                      {routine.description || `${routine.exercises.length} exercises`}
                    </Text>
                    <View style={styles.routineOptionMeta}>
                      <Text style={styles.routineOptionDuration}>
                        ~{routine.estimatedDuration}min
                      </Text>
                      <Text style={styles.routineOptionDifficulty}>
                        {routine.difficulty}
                      </Text>
                      {routine.isCustom && (
                        <Text style={styles.customBadge}>Custom</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.routineOptionActions}>
                    {routineSchedule[selectedDay] === routine.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
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
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 16,
  },
  defaultToggleInfo: {
    flex: 1,
  },
  defaultToggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  defaultToggleSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  bundleStats: {
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
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dayRoutine: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dayActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 8,
  },
  schedulePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewDay: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  previewDayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  previewDayContent: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  previewRestDay: {
    backgroundColor: '#f0f0f0',
  },
  previewRestText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  previewRoutineName: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewDuration: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
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
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalBody: {
    maxHeight: 400,
  },
  routineOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  routineOptionSelected: {
    backgroundColor: '#f0f8f0',
  },
  routineOptionInfo: {
    flex: 1,
  },
  routineOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  routineOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  routineOptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  routineOptionDuration: {
    fontSize: 12,
    color: '#4CAF50',
    marginRight: 12,
  },
  routineOptionDifficulty: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
    marginRight: 12,
  },
  customBadge: {
    fontSize: 10,
    color: '#ff9800',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  routineOptionActions: {
    marginLeft: 12,
  },
  restDayIcon: {
    marginLeft: 12,
  },
}); 