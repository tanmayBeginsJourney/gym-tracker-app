import { Exercise } from '../types';

export const defaultExercises: Exercise[] = [
  // Chest Exercises
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'chest',
    muscleGroups: ['chest', 'triceps', 'front delts'],
    instructions: 'Lie on bench, grip bar shoulder-width apart, lower to chest, press up explosively.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell', 'bench']
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'chest',
    muscleGroups: ['chest', 'triceps', 'core'],
    instructions: 'Start in plank position, lower body until chest nearly touches ground, push back up.',
    difficulty: 'beginner',
    equipmentNeeded: []
  },
  {
    id: 'dumbbell-press',
    name: 'Dumbbell Press',
    category: 'chest',
    muscleGroups: ['chest', 'triceps', 'front delts'],
    instructions: 'Lie on bench with dumbbells, press up from chest level to arms extended.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells', 'bench']
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    category: 'chest',
    muscleGroups: ['upper chest', 'front delts', 'triceps'],
    instructions: 'Set bench to 30-45 degrees, press barbell from upper chest.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell', 'incline bench']
  },

  // Back Exercises
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'back',
    muscleGroups: ['lower back', 'glutes', 'hamstrings', 'traps'],
    instructions: 'Stand with feet hip-width, grip bar, lift by extending hips and knees simultaneously.',
    difficulty: 'advanced',
    equipmentNeeded: ['barbell']
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    category: 'back',
    muscleGroups: ['lats', 'rhomboids', 'biceps'],
    instructions: 'Hang from bar with overhand grip, pull body up until chin over bar.',
    difficulty: 'intermediate',
    equipmentNeeded: ['pull-up bar']
  },
  {
    id: 'bent-over-row',
    name: 'Bent Over Row',
    category: 'back',
    muscleGroups: ['lats', 'rhomboids', 'rear delts'],
    instructions: 'Bend at hips holding barbell, pull bar to lower chest, squeeze shoulder blades.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell']
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    category: 'back',
    muscleGroups: ['lats', 'rhomboids', 'biceps'],
    instructions: 'Sit at lat pulldown machine, pull bar down to upper chest.',
    difficulty: 'beginner',
    equipmentNeeded: ['lat pulldown machine']
  },

  // Leg Exercises
  {
    id: 'squat',
    name: 'Squat',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes', 'core'],
    instructions: 'Stand with feet shoulder-width apart, lower hips back and down, return to standing.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell', 'squat rack']
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes'],
    instructions: 'Sit in leg press machine, lower weight by bending knees, press back up.',
    difficulty: 'beginner',
    equipmentNeeded: ['leg press machine']
  },
  {
    id: 'lunges',
    name: 'Lunges',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    instructions: 'Step forward into lunge position, lower back knee toward ground, return to standing.',
    difficulty: 'beginner',
    equipmentNeeded: []
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    category: 'legs',
    muscleGroups: ['hamstrings'],
    instructions: 'Lie face down on leg curl machine, curl heels toward glutes.',
    difficulty: 'beginner',
    equipmentNeeded: ['leg curl machine']
  },

  // Shoulder Exercises
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    category: 'shoulders',
    muscleGroups: ['front delts', 'side delts', 'triceps'],
    instructions: 'Stand with barbell at shoulder level, press overhead to arms extended.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell']
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    category: 'shoulders',
    muscleGroups: ['side delts'],
    instructions: 'Hold dumbbells at sides, raise arms out to shoulder height.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells']
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    category: 'shoulders',
    muscleGroups: ['rear delts'],
    instructions: 'Bend forward holding dumbbells, raise arms out to sides squeezing shoulder blades.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells']
  },

  // Arm Exercises
  {
    id: 'bicep-curl',
    name: 'Bicep Curl',
    category: 'arms',
    muscleGroups: ['biceps'],
    instructions: 'Hold dumbbells at sides, curl up by flexing biceps, lower with control.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells']
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    category: 'arms',
    muscleGroups: ['triceps'],
    instructions: 'Support body on parallel bars or bench, lower by bending elbows, press back up.',
    difficulty: 'intermediate',
    equipmentNeeded: ['dip bars']
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    category: 'arms',
    muscleGroups: ['biceps', 'forearms'],
    instructions: 'Hold dumbbells with neutral grip, curl up keeping palms facing each other.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells']
  },

  // Core Exercises
  {
    id: 'plank',
    name: 'Plank',
    category: 'core',
    muscleGroups: ['core', 'shoulders'],
    instructions: 'Hold body in straight line from head to heels, maintain position.',
    difficulty: 'beginner',
    equipmentNeeded: []
  },
  {
    id: 'crunches',
    name: 'Crunches',
    category: 'core',
    muscleGroups: ['abs'],
    instructions: 'Lie on back, knees bent, lift shoulders off ground using abs.',
    difficulty: 'beginner',
    equipmentNeeded: []
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    category: 'core',
    muscleGroups: ['obliques', 'abs'],
    instructions: 'Sit with knees bent, lean back slightly, rotate torso side to side.',
    difficulty: 'beginner',
    equipmentNeeded: []
  },

  // Cardio Exercises
  {
    id: 'treadmill-run',
    name: 'Treadmill Run',
    category: 'cardio',
    muscleGroups: ['legs', 'cardiovascular'],
    instructions: 'Run at steady pace on treadmill for desired duration.',
    difficulty: 'beginner',
    equipmentNeeded: ['treadmill']
  },
  {
    id: 'cycling',
    name: 'Stationary Bike',
    category: 'cardio',
    muscleGroups: ['legs', 'cardiovascular'],
    instructions: 'Pedal at consistent pace for desired duration and intensity.',
    difficulty: 'beginner',
    equipmentNeeded: ['stationary bike']
  },
  {
    id: 'rowing',
    name: 'Rowing Machine',
    category: 'cardio',
    muscleGroups: ['back', 'legs', 'arms', 'cardiovascular'],
    instructions: 'Pull handle to chest while pushing with legs, return with control.',
    difficulty: 'intermediate',
    equipmentNeeded: ['rowing machine']
  }
];

// Sample workout routines
export const defaultRoutines = [
  {
    id: 'beginner-full-body',
    name: 'Beginner Full Body',
    description: 'A complete workout for beginners hitting all major muscle groups',
    exercises: [
      { exerciseId: 'squat', exerciseName: 'Squat', targetSets: 3, targetReps: 10, targetWeight: 40 },
      { exerciseId: 'push-ups', exerciseName: 'Push-ups', targetSets: 3, targetReps: 8 },
      { exerciseId: 'bent-over-row', exerciseName: 'Bent Over Row', targetSets: 3, targetReps: 10, targetWeight: 30 },
      { exerciseId: 'overhead-press', exerciseName: 'Overhead Press', targetSets: 3, targetReps: 8, targetWeight: 25 },
      { exerciseId: 'plank', exerciseName: 'Plank', targetSets: 3, targetReps: 30 }
    ],
    difficulty: 'beginner' as const,
    estimatedDuration: 45,
    muscleGroups: ['full body']
  },
  {
    id: 'push-day',
    name: 'Push Day',
    description: 'Focus on chest, shoulders, and triceps',
    exercises: [
      { exerciseId: 'bench-press', exerciseName: 'Bench Press', targetSets: 4, targetReps: 8, targetWeight: 60 },
      { exerciseId: 'incline-bench-press', exerciseName: 'Incline Bench Press', targetSets: 3, targetReps: 10, targetWeight: 50 },
      { exerciseId: 'overhead-press', exerciseName: 'Overhead Press', targetSets: 3, targetReps: 8, targetWeight: 40 },
      { exerciseId: 'lateral-raise', exerciseName: 'Lateral Raise', targetSets: 3, targetReps: 12, targetWeight: 10 },
      { exerciseId: 'tricep-dips', exerciseName: 'Tricep Dips', targetSets: 3, targetReps: 10 }
    ],
    difficulty: 'intermediate' as const,
    estimatedDuration: 60,
    muscleGroups: ['chest', 'shoulders', 'triceps']
  }
]; 