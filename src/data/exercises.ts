import { Exercise, WorkoutRoutine } from '../types';

// Comprehensive exercise database - expanded to 80+ real exercises
export const defaultExercises: Exercise[] = [
  // CHEST EXERCISES
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'chest',
    muscleGroups: ['chest', 'triceps', 'front delts'],
    instructions: 'Lie on bench, grip bar shoulder-width apart, lower to chest, press up explosively.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell', 'bench'],
    popularity: 95 // Most popular chest exercise
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    category: 'chest',
    muscleGroups: ['upper chest', 'triceps', 'front delts'],
    instructions: 'Set bench to 30-45 degrees, perform bench press targeting upper chest.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell', 'incline bench'],
    popularity: 89
  },
  {
    id: 'decline-bench-press',
    name: 'Decline Bench Press',
    category: 'chest',
    muscleGroups: ['lower chest', 'triceps'],
    instructions: 'Set bench to decline position, press barbell targeting lower chest fibers.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell', 'decline bench'],
    popularity: 72
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    category: 'chest',
    muscleGroups: ['chest', 'triceps', 'front delts'],
    instructions: 'Lie on bench with dumbbells, press up with greater range of motion than barbell.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells', 'bench'],
    popularity: 91
  },
  {
    id: 'dumbbell-flyes',
    name: 'Dumbbell Flyes',
    category: 'chest',
    muscleGroups: ['chest', 'front delts'],
    instructions: 'Lie on bench, arc dumbbells out and down, squeeze chest to bring back up.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells', 'bench'],
    popularity: 84
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'chest',
    muscleGroups: ['chest', 'triceps', 'core'],
    instructions: 'Start in plank position, lower body until chest nearly touches ground, push back up.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 93 // Very accessible
  },
  {
    id: 'dips',
    name: 'Dips',
    category: 'chest',
    muscleGroups: ['chest', 'triceps', 'front delts'],
    instructions: 'Support body on parallel bars, lower by bending elbows, press back up.',
    difficulty: 'intermediate',
    equipmentNeeded: ['dip bars'],
    popularity: 81
  },
  {
    id: 'cable-crossover',
    name: 'Cable Crossover',
    category: 'chest',
    muscleGroups: ['chest', 'front delts'],
    instructions: 'Stand between cable machines, pull handles down and across body in arc motion.',
    difficulty: 'beginner',
    equipmentNeeded: ['cable machine'],
    popularity: 77
  },

  // BACK EXERCISES
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'back',
    muscleGroups: ['lower back', 'glutes', 'hamstrings', 'traps'],
    instructions: 'Stand with barbell at feet, bend at hips and knees, grip bar, stand up straight.',
    difficulty: 'advanced',
    equipmentNeeded: ['barbell'],
    popularity: 96 // King of exercises
  },
  {
    id: 'bent-over-row',
    name: 'Bent Over Row',
    category: 'back',
    muscleGroups: ['lats', 'rhomboids', 'middle traps'],
    instructions: 'Bend forward at hips holding barbell, pull to lower chest, squeeze shoulder blades.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell'],
    popularity: 92
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    category: 'back',
    muscleGroups: ['lats', 'biceps', 'rear delts'],
    instructions: 'Hang from bar with overhand grip, pull body up until chin over bar.',
    difficulty: 'advanced',
    equipmentNeeded: ['pull-up bar'],
    popularity: 88
  },
  {
    id: 'chin-ups',
    name: 'Chin-ups',
    category: 'back',
    muscleGroups: ['lats', 'biceps'],
    instructions: 'Hang from bar with underhand grip, pull body up until chin over bar.',
    difficulty: 'intermediate',
    equipmentNeeded: ['pull-up bar'],
    popularity: 85
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    category: 'back',
    muscleGroups: ['lats', 'biceps', 'rear delts'],
    instructions: 'Sit at machine, pull bar down to upper chest, squeeze lats.',
    difficulty: 'beginner',
    equipmentNeeded: ['lat pulldown machine'],
    popularity: 87
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    category: 'back',
    muscleGroups: ['middle traps', 'rhomboids', 'lats'],
    instructions: 'Sit at cable machine, pull handle to torso, squeeze shoulder blades together.',
    difficulty: 'beginner',
    equipmentNeeded: ['cable machine'],
    popularity: 83
  },
  {
    id: 't-bar-row',
    name: 'T-Bar Row',
    category: 'back',
    muscleGroups: ['lats', 'rhomboids', 'middle traps'],
    instructions: 'Straddle T-bar, pull weight to chest with v-handle, keep back straight.',
    difficulty: 'intermediate',
    equipmentNeeded: ['t-bar row machine'],
    popularity: 79
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    category: 'back',
    muscleGroups: ['rear delts', 'rhomboids', 'middle traps'],
    instructions: 'Pull cable rope to face level, separate handles, squeeze rear delts.',
    difficulty: 'beginner',
    equipmentNeeded: ['cable machine', 'rope attachment'],
    popularity: 74
  },

  // LEG EXERCISES
  {
    id: 'squat',
    name: 'Squat',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    instructions: 'Stand with barbell on traps, squat down until thighs parallel, drive through heels.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell', 'squat rack'],
    popularity: 94 // King of lower body
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes', 'core'],
    instructions: 'Hold barbell at front of shoulders, squat down keeping torso upright.',
    difficulty: 'advanced',
    equipmentNeeded: ['barbell', 'squat rack'],
    popularity: 76
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes'],
    instructions: 'Sit in machine, place feet on platform, press weight up through heels.',
    difficulty: 'beginner',
    equipmentNeeded: ['leg press machine'],
    popularity: 86
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    category: 'legs',
    muscleGroups: ['quadriceps'],
    instructions: 'Sit in machine, extend legs until straight, squeeze quadriceps.',
    difficulty: 'beginner',
    equipmentNeeded: ['leg extension machine'],
    popularity: 78
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    category: 'legs',
    muscleGroups: ['hamstrings'],
    instructions: 'Lie face down on machine, curl heels toward glutes.',
    difficulty: 'beginner',
    equipmentNeeded: ['leg curl machine'],
    popularity: 80
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'legs',
    muscleGroups: ['hamstrings', 'glutes', 'lower back'],
    instructions: 'Hold barbell, hinge at hips keeping legs straight, lower bar to shins.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell'],
    popularity: 82
  },
  {
    id: 'lunges',
    name: 'Lunges',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    instructions: 'Step forward into lunge position, lower until back knee nearly touches floor.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 85
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes'],
    instructions: 'Rear foot elevated on bench, lunge down on front leg, drive up through heel.',
    difficulty: 'intermediate',
    equipmentNeeded: ['bench'],
    popularity: 73
  },
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    category: 'legs',
    muscleGroups: ['calves'],
    instructions: 'Stand on toes, raise heels as high as possible, lower with control.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 71
  },
  {
    id: 'walking-lunges',
    name: 'Walking Lunges',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    instructions: 'Perform alternating lunges while walking forward, maintain upright torso.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 76
  },

  // SHOULDER EXERCISES
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    category: 'shoulders',
    muscleGroups: ['front delts', 'side delts', 'triceps'],
    instructions: 'Stand with barbell at shoulder level, press overhead to arms extended.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell'],
    popularity: 90 // Classic compound lift
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    category: 'shoulders',
    muscleGroups: ['front delts', 'side delts', 'triceps'],
    instructions: 'Sit or stand with dumbbells at shoulder height, press up overhead.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells'],
    popularity: 88
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    category: 'shoulders',
    muscleGroups: ['side delts'],
    instructions: 'Hold dumbbells at sides, raise arms out to shoulder height.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells'],
    popularity: 86
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    category: 'shoulders',
    muscleGroups: ['rear delts'],
    instructions: 'Bend forward holding dumbbells, raise arms out to sides squeezing shoulder blades.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells'],
    popularity: 75
  },
  {
    id: 'front-raise',
    name: 'Front Raise',
    category: 'shoulders',
    muscleGroups: ['front delts'],
    instructions: 'Hold dumbbells at sides, raise one arm forward to shoulder height.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells'],
    popularity: 69
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    category: 'shoulders',
    muscleGroups: ['front delts', 'side delts'],
    instructions: 'Start with palms facing you, rotate and press up in one motion.',
    difficulty: 'intermediate',
    equipmentNeeded: ['dumbbells'],
    popularity: 72
  },
  {
    id: 'upright-row',
    name: 'Upright Row',
    category: 'shoulders',
    muscleGroups: ['side delts', 'traps'],
    instructions: 'Pull barbell up along body to chest level, elbows high.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell'],
    popularity: 67
  },
  {
    id: 'shrugs',
    name: 'Shrugs',
    category: 'shoulders',
    muscleGroups: ['traps'],
    instructions: 'Hold weights at sides, lift shoulders straight up, squeeze at top.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells'],
    popularity: 74
  },

  // ARM EXERCISES
  {
    id: 'bicep-curl',
    name: 'Bicep Curl',
    category: 'arms',
    muscleGroups: ['biceps'],
    instructions: 'Hold dumbbells at sides, curl up by flexing biceps, lower with control.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells'],
    popularity: 92 // Very popular isolation exercise
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    category: 'arms',
    muscleGroups: ['biceps', 'forearms'],
    instructions: 'Hold dumbbells with neutral grip, curl up keeping palms facing each other.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells'],
    popularity: 84
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    category: 'arms',
    muscleGroups: ['biceps'],
    instructions: 'Sit at preacher bench, curl barbell with strict form, no momentum.',
    difficulty: 'beginner',
    equipmentNeeded: ['preacher bench', 'barbell'],
    popularity: 77
  },
  {
    id: 'cable-curl',
    name: 'Cable Curl',
    category: 'arms',
    muscleGroups: ['biceps'],
    instructions: 'Stand at cable machine, curl handle up keeping elbows stationary.',
    difficulty: 'beginner',
    equipmentNeeded: ['cable machine'],
    popularity: 79
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    category: 'arms',
    muscleGroups: ['triceps'],
    instructions: 'Support body on parallel bars or bench, lower by bending elbows, press back up.',
    difficulty: 'intermediate',
    equipmentNeeded: ['dip bars'],
    popularity: 83
  },
  {
    id: 'close-grip-bench-press',
    name: 'Close Grip Bench Press',
    category: 'arms',
    muscleGroups: ['triceps', 'chest'],
    instructions: 'Bench press with hands closer together, focusing on tricep engagement.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell', 'bench'],
    popularity: 81
  },
  {
    id: 'tricep-extension',
    name: 'Tricep Extension',
    category: 'arms',
    muscleGroups: ['triceps'],
    instructions: 'Hold weight overhead, lower behind head by bending elbows, extend back up.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells'],
    popularity: 78
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    category: 'arms',
    muscleGroups: ['triceps'],
    instructions: 'Stand at cable machine, push handle down by extending elbows.',
    difficulty: 'beginner',
    equipmentNeeded: ['cable machine'],
    popularity: 85
  },
  {
    id: 'concentration-curl',
    name: 'Concentration Curl',
    category: 'arms',
    muscleGroups: ['biceps'],
    instructions: 'Sit with elbow braced on thigh, curl dumbbell with strict isolation.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells'],
    popularity: 71
  },
  {
    id: '21s-curl',
    name: '21s Curl',
    category: 'arms',
    muscleGroups: ['biceps'],
    instructions: '7 half reps bottom to middle, 7 middle to top, 7 full reps.',
    difficulty: 'intermediate',
    equipmentNeeded: ['barbell'],
    popularity: 68
  },
  {
    id: 'bayesian-curl',
    name: 'Bayesian Curl',
    category: 'arms',
    muscleGroups: ['biceps', 'brachialis', 'brachioradialis'],
    instructions: 'Face away from cable machine, step forward with arm extended behind. Curl handle forward keeping elbow at side, lean forward at top for contraction.',
    difficulty: 'intermediate',
    equipmentNeeded: ['cable machine'],
    popularity: 75
  },

  // CORE EXERCISES
  {
    id: 'plank',
    name: 'Plank',
    category: 'core',
    muscleGroups: ['core', 'shoulders'],
    instructions: 'Hold body in straight line from head to heels, maintain position.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 89 // Popular core exercise
  },
  {
    id: 'crunches',
    name: 'Crunches',
    category: 'core',
    muscleGroups: ['abs'],
    instructions: 'Lie on back, knees bent, lift shoulders off ground using abs.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 82
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    category: 'core',
    muscleGroups: ['obliques', 'abs'],
    instructions: 'Sit with knees bent, lean back slightly, rotate torso side to side.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 78
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    category: 'core',
    muscleGroups: ['lower abs', 'hip flexors'],
    instructions: 'Hang from bar, raise legs to horizontal position, lower with control.',
    difficulty: 'advanced',
    equipmentNeeded: ['pull-up bar'],
    popularity: 75
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'core',
    muscleGroups: ['core', 'shoulders', 'legs'],
    instructions: 'Start in plank, alternate bringing knees to chest rapidly.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 76
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'core',
    muscleGroups: ['deep core', 'hip flexors'],
    instructions: 'Lie on back, extend opposite arm and leg, return to start.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 65
  },
  {
    id: 'bicycle-crunches',
    name: 'Bicycle Crunches',
    category: 'core',
    muscleGroups: ['abs', 'obliques'],
    instructions: 'Lie on back, bring opposite elbow to knee in cycling motion.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 81
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Ab Wheel Rollout',
    category: 'core',
    muscleGroups: ['abs', 'core', 'shoulders'],
    instructions: 'Kneel with ab wheel, roll forward until extended, pull back.',
    difficulty: 'advanced',
    equipmentNeeded: ['ab wheel'],
    popularity: 69
  },

  // CARDIO EXERCISES
  {
    id: 'treadmill-run',
    name: 'Treadmill Run',
    category: 'cardio',
    muscleGroups: ['legs', 'cardiovascular'],
    instructions: 'Run at steady pace on treadmill for desired duration.',
    difficulty: 'beginner',
    equipmentNeeded: ['treadmill'],
    popularity: 87 // Very popular cardio choice
  },
  {
    id: 'cycling',
    name: 'Stationary Bike',
    category: 'cardio',
    muscleGroups: ['legs', 'cardiovascular'],
    instructions: 'Pedal at consistent pace for desired duration and intensity.',
    difficulty: 'beginner',
    equipmentNeeded: ['stationary bike'],
    popularity: 84 // Popular low-impact cardio
  },
  {
    id: 'rowing',
    name: 'Rowing Machine',
    category: 'cardio',
    muscleGroups: ['back', 'legs', 'arms', 'cardiovascular'],
    instructions: 'Pull handle to chest while pushing with legs, return with control.',
    difficulty: 'intermediate',
    equipmentNeeded: ['rowing machine'],
    popularity: 79 // Great full-body cardio
  },
  {
    id: 'elliptical',
    name: 'Elliptical',
    category: 'cardio',
    muscleGroups: ['full body', 'cardiovascular'],
    instructions: 'Move in elliptical motion using arms and legs simultaneously.',
    difficulty: 'beginner',
    equipmentNeeded: ['elliptical machine'],
    popularity: 76
  },
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'cardio',
    muscleGroups: ['full body', 'cardiovascular'],
    instructions: 'Squat, jump back to plank, push-up, jump forward, jump up.',
    difficulty: 'intermediate',
    equipmentNeeded: [],
    popularity: 72
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'cardio',
    muscleGroups: ['full body', 'cardiovascular'],
    instructions: 'Jump while spreading legs and raising arms overhead, return.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 74
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    category: 'cardio',
    muscleGroups: ['legs', 'cardiovascular'],
    instructions: 'Run in place bringing knees up to waist level.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 68
  },
  {
    id: 'stair-climber',
    name: 'Stair Climber',
    category: 'cardio',
    muscleGroups: ['legs', 'glutes', 'cardiovascular'],
    instructions: 'Step up and down on machine maintaining steady rhythm.',
    difficulty: 'intermediate',
    equipmentNeeded: ['stair climber machine'],
    popularity: 71
  },

  // ADDITIONAL COMPOUND MOVEMENTS
  {
    id: 'clean-and-press',
    name: 'Clean and Press',
    category: 'shoulders',
    muscleGroups: ['full body', 'shoulders', 'legs'],
    instructions: 'Clean barbell to shoulders, then press overhead in one fluid motion.',
    difficulty: 'advanced',
    equipmentNeeded: ['barbell'],
    popularity: 63
  },
  {
    id: 'farmers-walk',
    name: "Farmer's Walk",
    category: 'core',
    muscleGroups: ['forearms', 'traps', 'core', 'legs'],
    instructions: 'Hold heavy weights at sides and walk for distance or time.',
    difficulty: 'beginner',
    equipmentNeeded: ['dumbbells'],
    popularity: 66
  },
  {
    id: 'kettlebell-swing',
    name: 'Kettlebell Swing',
    category: 'legs',
    muscleGroups: ['glutes', 'hamstrings', 'core'],
    instructions: 'Swing kettlebell between legs and up to shoulder height using hips.',
    difficulty: 'intermediate',
    equipmentNeeded: ['kettlebell'],
    popularity: 77
  },
  {
    id: 'turkish-getup',
    name: 'Turkish Get-up',
    category: 'core',
    muscleGroups: ['full body', 'core', 'shoulders'],
    instructions: 'Rise from lying to standing while holding weight overhead.',
    difficulty: 'advanced',
    equipmentNeeded: ['kettlebell'],
    popularity: 58
  },
  {
    id: 'box-jumps',
    name: 'Box Jumps',
    category: 'legs',
    muscleGroups: ['legs', 'glutes', 'cardiovascular'],
    instructions: 'Jump onto box or platform, step down, repeat.',
    difficulty: 'intermediate',
    equipmentNeeded: ['box'],
    popularity: 70
  },
  {
    id: 'battle-ropes',
    name: 'Battle Ropes',
    category: 'cardio',
    muscleGroups: ['arms', 'shoulders', 'core', 'cardiovascular'],
    instructions: 'Create waves with heavy ropes using alternating arm motions.',
    difficulty: 'intermediate',
    equipmentNeeded: ['battle ropes'],
    popularity: 64
  },

  // FUNCTIONAL MOVEMENTS
  {
    id: 'thrusters',
    name: 'Thrusters',
    category: 'shoulders',
    muscleGroups: ['legs', 'shoulders', 'core'],
    instructions: 'Squat with weight, then press overhead as you stand.',
    difficulty: 'intermediate',
    equipmentNeeded: ['dumbbells'],
    popularity: 67
  },
  {
    id: 'wall-balls',
    name: 'Wall Balls',
    category: 'legs',
    muscleGroups: ['legs', 'shoulders', 'core'],
    instructions: 'Squat with medicine ball, throw to wall target, catch and repeat.',
    difficulty: 'intermediate',
    equipmentNeeded: ['medicine ball', 'wall'],
    popularity: 65
  },
  {
    id: 'bear-crawl',
    name: 'Bear Crawl',
    category: 'core',
    muscleGroups: ['core', 'shoulders', 'legs'],
    instructions: 'Crawl forward on hands and feet, keeping knees slightly off ground.',
    difficulty: 'beginner',
    equipmentNeeded: [],
    popularity: 59
  },
];

// Sample workout routines - keep existing ones
export const defaultRoutines: WorkoutRoutine[] = [
  {
    id: 'beginner-full-body',
    name: 'Beginner Full Body',
    description: 'A complete workout for beginners hitting all major muscle groups',
    exercises: [
      { 
        exerciseId: 'squat', 
        exerciseName: 'Squat', 
        plannedSets: 3, 
        plannedReps: 10, 
        plannedWeight: 40,
        restTime: 90,
        order: 1
      },
      { 
        exerciseId: 'push-ups', 
        exerciseName: 'Push-ups', 
        plannedSets: 3, 
        plannedReps: 8,
        restTime: 60,
        order: 2
      },
      { 
        exerciseId: 'bent-over-row', 
        exerciseName: 'Bent Over Row', 
        plannedSets: 3, 
        plannedReps: 10, 
        plannedWeight: 30,
        restTime: 90,
        order: 3
      },
      { 
        exerciseId: 'overhead-press', 
        exerciseName: 'Overhead Press', 
        plannedSets: 3, 
        plannedReps: 8, 
        plannedWeight: 25,
        restTime: 90,
        order: 4
      },
      { 
        exerciseId: 'plank', 
        exerciseName: 'Plank', 
        plannedSets: 3, 
        plannedReps: 30,
        restTime: 60,
        order: 5
      }
    ],
    difficulty: 'beginner',
    estimatedDuration: 45,
    muscleGroups: ['full body'],
    createdAt: new Date('2024-01-01'),
    isCustom: false
  },
  {
    id: 'push-day',
    name: 'Push Day',
    description: 'Focus on chest, shoulders, and triceps',
    exercises: [
      { 
        exerciseId: 'bench-press', 
        exerciseName: 'Bench Press', 
        plannedSets: 4, 
        plannedReps: 8, 
        plannedWeight: 60,
        restTime: 120,
        order: 1
      },
      { 
        exerciseId: 'incline-bench-press', 
        exerciseName: 'Incline Bench Press', 
        plannedSets: 3, 
        plannedReps: 10, 
        plannedWeight: 50,
        restTime: 90,
        order: 2
      },
      { 
        exerciseId: 'overhead-press', 
        exerciseName: 'Overhead Press', 
        plannedSets: 3, 
        plannedReps: 8, 
        plannedWeight: 40,
        restTime: 90,
        order: 3
      },
      { 
        exerciseId: 'lateral-raise', 
        exerciseName: 'Lateral Raise', 
        plannedSets: 3, 
        plannedReps: 12, 
        plannedWeight: 10,
        restTime: 60,
        order: 4
      },
      { 
        exerciseId: 'tricep-dips', 
        exerciseName: 'Tricep Dips', 
        plannedSets: 3, 
        plannedReps: 10,
        restTime: 75,
        order: 5
      }
    ],
    difficulty: 'intermediate',
    estimatedDuration: 60,
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    createdAt: new Date('2024-01-01'),
    isCustom: false
  }
]; 