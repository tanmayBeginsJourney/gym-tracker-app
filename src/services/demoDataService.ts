import { 
  DemoProfile, 
  UserProfile, 
  Workout, 
  WorkoutRoutine, 
  RoutineBundle, 
  Achievement, 
  AnonymousUserData,
  WorkoutExercise,
  WorkoutSet,
  RoutineExercise,
  DayOfWeek
} from '../types';

class DemoDataService {
  private readonly baseDate = new Date(); // Current date
  private readonly startDate = new Date(this.baseDate.getTime() - (90 * 24 * 60 * 60 * 1000)); // 90 days ago

  // Main method to get all demo profiles
  getAllDemoProfiles(): DemoProfile[] {
    return [
      this.generateTanmayProfile(),
      this.generateAlexProfile(),
      this.generateMayaProfile(),
      this.generateEmmaProfile(),
    ];
  }

  getDemoProfile(profileId: string): DemoProfile | null {
    const profiles = this.getAllDemoProfiles();
    return profiles.find(p => p.id === profileId) || null;
  }

  // Generate Tanmay Profile - Goal-Oriented Intermediate
  private generateTanmayProfile(): DemoProfile {
    const demographics: UserProfile = {
      id: 'demo-tanmay',
      name: 'Tanmay',
      age: 25,
      weight: 70,
      height: 175,
      gender: 'male',
      experienceLevel: 'intermediate',
      goals: ['strength', 'muscle'],
      createdAt: this.startDate,
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
        additionalNotes: 'Wants lean physique with good muscle definition. Focuses on progressive overload.'
      }
    };

    const workoutHistory = this.generateWorkoutHistory('tanmay', 36, 12); // 3 months, 36 workouts
    const routines = this.generateTanmayRoutines();
    const bundles = this.generateTanmayBundles(routines);
    const achievements = this.calculateAchievements(workoutHistory, 'intermediate');
    const socialData = this.generateSocialData(demographics);

    return {
      id: 'demo-tanmay',
      name: 'Tanmay',
      description: 'Goal-oriented intermediate focused on lean muscle and strength gains',
      avatar: '💪',
      demographics,
      workoutHistory,
      routines,
      bundles,
      achievements,
      socialData,
    };
  }

  // Generate Alex Profile - Powerlifting Focused
  private generateAlexProfile(): DemoProfile {
    const demographics: UserProfile = {
      id: 'demo-alex',
      name: 'Alex',
      age: 28,
      weight: 85,
      height: 180,
      gender: 'male',
      experienceLevel: 'advanced',
      goals: ['strength'],
      createdAt: new Date(this.baseDate.getTime() - (60 * 24 * 60 * 60 * 1000)), // 2 months ago
      personalDetails: {
        targetPhysique: 'powerlifter',
        bodyFatGoal: 18,
        specificGoals: ['bench 150kg', 'squat 200kg', 'deadlift 220kg'],
        weakBodyParts: ['chest'],
        priorityMuscles: ['quadriceps', 'glutes', 'posterior deltoids'],
        preferredWorkoutStyle: 'powerlifting',
        workoutFrequency: 4,
        sessionDuration: 90,
        restDayPreferences: ['complete rest', 'mobility work'],
        injuries: [],
        allergies: [],
        dietaryRestrictions: [],
        motivationalFactors: ['strength PRs', 'competition goals'],
        personalChallenges: ['bench press plateau', 'mobility'],
        additionalNotes: 'Serious powerlifter preparing for competition. Focuses on the big 3 lifts.'
      }
    };

    const workoutHistory = this.generateWorkoutHistory('alex', 48, 24); // 6 months, 48 workouts
    const routines = this.generateAlexRoutines();
    const bundles = this.generateAlexBundles(routines);
    const achievements = this.calculateAchievements(workoutHistory, 'advanced');
    const socialData = this.generateSocialData(demographics);

    return {
      id: 'demo-alex',
      name: 'Alex',
      description: 'Advanced powerlifter focused on maximum strength and competition prep',
      avatar: '🏋️',
      demographics,
      workoutHistory,
      routines,
      bundles,
      achievements,
      socialData,
    };
  }

  // Generate Maya Profile - Beginner Journey
  private generateMayaProfile(): DemoProfile {
    const demographics: UserProfile = {
      id: 'demo-maya',
      name: 'Maya',
      age: 22,
      weight: 55,
      height: 165,
      gender: 'female',
      experienceLevel: 'beginner',
      goals: ['muscle', 'endurance'],
      createdAt: new Date(this.baseDate.getTime() - (45 * 24 * 60 * 60 * 1000)), // 1.5 months ago
      personalDetails: {
        targetPhysique: 'athletic',
        bodyFatGoal: 20,
        specificGoals: ['gain confidence', 'build strength', 'improve posture'],
        weakBodyParts: ['core', 'shoulders', 'back'],
        priorityMuscles: ['glutes', 'core', 'shoulders'],
        preferredWorkoutStyle: 'mixed',
        workoutFrequency: 3,
        sessionDuration: 45,
        restDayPreferences: ['yoga', 'walking'],
        injuries: [],
        allergies: [],
        dietaryRestrictions: ['vegetarian'],
        motivationalFactors: ['feeling stronger', 'body confidence', 'energy levels'],
        personalChallenges: ['gym intimidation', 'consistency'],
        additionalNotes: 'New to fitness, building foundational strength and confidence.'
      }
    };

    const workoutHistory = this.generateWorkoutHistory('maya', 18, 6); // 6 weeks, 18 workouts
    const routines = this.generateMayaRoutines();
    const bundles = this.generateMayaBundles(routines);
    const achievements = this.calculateAchievements(workoutHistory, 'beginner');
    const socialData = this.generateSocialData(demographics);

    return {
      id: 'demo-maya',
      name: 'Maya',
      description: 'Fitness beginner focused on building confidence and healthy habits',
      avatar: '🌟',
      demographics,
      workoutHistory,
      routines,
      bundles,
      achievements,
      socialData,
    };
  }

  // Generate Emma Profile - Consistency Champion
  private generateEmmaProfile(): DemoProfile {
    const demographics: UserProfile = {
      id: 'demo-emma',
      name: 'Emma',
      age: 32,
      weight: 62,
      height: 168,
      gender: 'female',
      experienceLevel: 'intermediate',
      goals: ['endurance', 'weight_loss'],
      createdAt: new Date(this.baseDate.getTime() - (75 * 24 * 60 * 60 * 1000)), // 2.5 months ago
      personalDetails: {
        targetPhysique: 'athletic',
        bodyFatGoal: 22,
        specificGoals: ['stress relief', 'work-life balance', 'long-term health'],
        weakBodyParts: ['back', 'core'],
        priorityMuscles: ['core', 'glutes', 'posterior deltoids'],
        preferredWorkoutStyle: 'mixed',
        workoutFrequency: 5,
        sessionDuration: 60,
        restDayPreferences: ['active recovery', 'stretching'],
        injuries: [
          {
            bodyPart: 'lower back',
            description: 'mild strain from poor posture',
            limitations: ['heavy deadlifts'],
            date: new Date('2024-06-15')
          }
        ],
        allergies: [],
        dietaryRestrictions: [],
        motivationalFactors: ['stress relief', 'energy levels', 'sleep quality'],
        personalChallenges: ['work stress', 'time management'],
        additionalNotes: 'Busy professional who prioritizes consistency over intensity.'
      }
    };

    const workoutHistory = this.generateWorkoutHistory('emma', 65, 16); // 4 months, 65 workouts
    const routines = this.generateEmmaRoutines();
    const bundles = this.generateEmmaBundles(routines);
    const achievements = this.calculateAchievements(workoutHistory, 'intermediate');
    const socialData = this.generateSocialData(demographics);

    return {
      id: 'demo-emma',
      name: 'Emma',
      description: 'Consistent intermediate focused on stress relief and work-life balance',
      avatar: '🎯',
      demographics,
      workoutHistory,
      routines,
      bundles,
      achievements,
      socialData,
    };
  }

  // Generate realistic workout history with progression (recent dates)
  private generateWorkoutHistory(profileType: string, totalWorkouts: number, totalWeeks: number): Workout[] {
    const workouts: Workout[] = [];
    const workoutsPerWeek = totalWorkouts / totalWeeks;
    
    // Start from totalWeeks ago and work forward to today
    const startDate = new Date(this.baseDate.getTime() - (totalWeeks * 7 * 24 * 60 * 60 * 1000));
    
    for (let week = 0; week < totalWeeks; week++) {
      const workoutsThisWeek = Math.floor(workoutsPerWeek) + (Math.random() > 0.5 ? 1 : 0);
      
      for (let workoutInWeek = 0; workoutInWeek < workoutsThisWeek; workoutInWeek++) {
        const workoutDate = new Date(startDate.getTime() + (week * 7 + workoutInWeek) * 24 * 60 * 60 * 1000);
        const workout = this.generateSingleWorkout(profileType, workoutDate, week, totalWeeks);
        workouts.push(workout);
      }
    }
    
    return workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private generateSingleWorkout(profileType: string, date: Date, weekNumber: number, totalWeeks: number): Workout {
    const workoutId = `demo-workout-${profileType}-${date.toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Define exercises based on profile type
    const exercisePool = this.getExercisePoolForProfile(profileType);
    const selectedExercises = this.selectExercisesForWorkout(exercisePool, profileType);
    
    const exercises: WorkoutExercise[] = selectedExercises.map(exerciseTemplate => {
      return this.generateWorkoutExercise(exerciseTemplate, weekNumber, totalWeeks, profileType);
    });

    return {
      id: workoutId,
      userId: `demo-${profileType}`,
      date,
      routineId: `demo-routine-${profileType}`,
      routineName: `${profileType.charAt(0).toUpperCase() + profileType.slice(1)}'s Routine`,
      exercises,
      duration: this.calculateWorkoutDuration(exercises, profileType),
      notes: this.generateWorkoutNotes(weekNumber, profileType),
      mood: (Math.floor(Math.random() * 2) + 4) as 4 | 5, // 4-5 (good moods)
      energyLevel: (Math.floor(Math.random() * 2) + 4) as 4 | 5, // 4-5 (good energy)
    };
  }

  private getExercisePoolForProfile(profileType: string): Array<{id: string, name: string, baseWeight: number, repRange: [number, number]}> {
    switch (profileType) {
      case 'tanmay':
        return [
          { id: 'bench-press', name: 'Bench Press', baseWeight: 60, repRange: [6, 10] },
          { id: 'squat', name: 'Squat', baseWeight: 80, repRange: [8, 12] },
          { id: 'deadlift', name: 'Deadlift', baseWeight: 100, repRange: [5, 8] },
          { id: 'incline-db-press', name: 'Incline Dumbbell Press', baseWeight: 30, repRange: [8, 12] },
          { id: 'lat-pulldown', name: 'Lat Pulldown', baseWeight: 50, repRange: [10, 15] },
        ];
      case 'alex':
        return [
          { id: 'bench-press', name: 'Bench Press', baseWeight: 100, repRange: [3, 5] },
          { id: 'squat', name: 'Squat', baseWeight: 140, repRange: [3, 5] },
          { id: 'deadlift', name: 'Deadlift', baseWeight: 160, repRange: [1, 3] },
          { id: 'overhead-press', name: 'Overhead Press', baseWeight: 60, repRange: [5, 8] },
          { id: 'barbell-row', name: 'Barbell Row', baseWeight: 80, repRange: [5, 8] },
        ];
      case 'maya':
        return [
          { id: 'bodyweight-squat', name: 'Bodyweight Squat', baseWeight: 0, repRange: [10, 15] },
          { id: 'push-up', name: 'Push-up', baseWeight: 0, repRange: [5, 12] },
          { id: 'assisted-pull-up', name: 'Assisted Pull-up', baseWeight: 20, repRange: [5, 10] },
          { id: 'dumbbell-press', name: 'Dumbbell Press', baseWeight: 10, repRange: [8, 12] },
          { id: 'goblet-squat', name: 'Goblet Squat', baseWeight: 15, repRange: [10, 15] },
        ];
      case 'emma':
        return [
          { id: 'leg-press', name: 'Leg Press', baseWeight: 60, repRange: [12, 15] },
          { id: 'chest-press', name: 'Chest Press', baseWeight: 25, repRange: [10, 15] },
          { id: 'cable-row', name: 'Cable Row', baseWeight: 30, repRange: [12, 15] },
          { id: 'shoulder-press', name: 'Shoulder Press', baseWeight: 15, repRange: [10, 12] },
          { id: 'lat-pulldown', name: 'Lat Pulldown', baseWeight: 35, repRange: [12, 15] },
        ];
      default:
        return [];
    }
  }

  private selectExercisesForWorkout(exercisePool: any[], profileType: string): any[] {
    const exerciseCount = profileType === 'alex' ? 3 : profileType === 'maya' ? 4 : 5;
    return exercisePool.slice(0, exerciseCount);
  }

  private generateWorkoutExercise(exerciseTemplate: any, weekNumber: number, totalWeeks: number, profileType: string): WorkoutExercise {
    const progressionFactor = weekNumber / totalWeeks;
    const currentWeight = this.calculateProgressedWeight(exerciseTemplate.baseWeight, progressionFactor, profileType);
    
    const setsCount = profileType === 'alex' ? 5 : profileType === 'maya' ? 3 : 4;
    const sets: WorkoutSet[] = [];
    
    for (let setIndex = 0; setIndex < setsCount; setIndex++) {
      const reps = this.calculateRepsForSet(exerciseTemplate.repRange, setIndex, setsCount);
      const weight = setIndex === 0 ? currentWeight * 0.8 : currentWeight; // Warm-up set
      
      sets.push({
        reps,
        weight: Math.round(weight * 2) / 2, // Round to nearest 0.5kg
        restTime: this.calculateRestTime(profileType, setIndex),
        completed: true,
        setNumber: setIndex + 1,
        notes: setIndex === setsCount - 1 && Math.random() > 0.8 ? 'Great set!' : undefined,
      });
    }

    return {
      exerciseId: exerciseTemplate.id,
      exerciseName: exerciseTemplate.name,
      sets,
      notes: Math.random() > 0.9 ? 'Felt strong today' : undefined,
    };
  }

  private calculateProgressedWeight(baseWeight: number, progressionFactor: number, profileType: string): number {
    if (baseWeight === 0) return 0; // Bodyweight exercises
    
    const progressionRate = {
      'tanmay': 1.4, // 40% increase over time
      'alex': 1.3,   // 30% increase (more advanced)
      'maya': 1.8,   // 80% increase (beginner gains)
      'emma': 1.2,   // 20% increase (consistency focused)
    }[profileType] || 1.2;
    
    return baseWeight * (1 + (progressionRate - 1) * progressionFactor);
  }

  private calculateRepsForSet(repRange: [number, number], setIndex: number, totalSets: number): number {
    const [minReps, maxReps] = repRange;
    const fatigueEffect = setIndex / totalSets; // Sets get harder
    const targetReps = maxReps - (fatigueEffect * (maxReps - minReps));
    return Math.max(minReps, Math.floor(targetReps + Math.random() * 2));
  }

  private calculateRestTime(profileType: string, setIndex: number): number {
    const baseRestTime = {
      'tanmay': 120, // 2 minutes
      'alex': 180,   // 3 minutes (powerlifting)
      'maya': 90,    // 1.5 minutes (beginner)
      'emma': 60,    // 1 minute (endurance focus)
    }[profileType] || 120;
    
    return baseRestTime + Math.random() * 30; // Add some variation
  }

  private calculateWorkoutDuration(exercises: WorkoutExercise[], profileType: string): number {
    const baseDuration = {
      'tanmay': 75,
      'alex': 90,
      'maya': 45,
      'emma': 60,
    }[profileType] || 60;
    
    return baseDuration + Math.floor(Math.random() * 20) - 10; // ±10 minutes variation
  }

  private generateWorkoutNotes(weekNumber: number, profileType: string): string {
    const noteOptions = [
      'Great workout today!',
      'Felt strong and focused',
      'New personal record!',
      'Challenging but rewarding',
      'Making good progress',
      undefined, // No notes sometimes
    ];
    
    return noteOptions[Math.floor(Math.random() * noteOptions.length)] || '';
  }

  // Generate profile-specific routines
  private generateTanmayRoutines(): WorkoutRoutine[] {
    return [
      {
        id: 'tanmay-push',
        name: "Tanmay's Push Day",
        description: 'Chest, shoulders, and triceps focused workout',
        exercises: [
          { exerciseId: 'bench-press', exerciseName: 'Bench Press', plannedSets: 4, plannedReps: 8, plannedWeight: 80, restTime: 120, notes: 'Focus on form', order: 1 },
          { exerciseId: 'incline-db-press', exerciseName: 'Incline Dumbbell Press', plannedSets: 3, plannedReps: 10, plannedWeight: 35, restTime: 90, notes: '', order: 2 },
          { exerciseId: 'overhead-press', exerciseName: 'Overhead Press', plannedSets: 3, plannedReps: 8, plannedWeight: 50, restTime: 90, notes: '', order: 3 },
        ],
        difficulty: 'intermediate',
        estimatedDuration: 75,
        muscleGroups: ['chest', 'shoulders', 'arms'],
        createdAt: this.baseDate,
        isCustom: false,
      },
      {
        id: 'tanmay-pull',
        name: "Tanmay's Pull Day",
        description: 'Back and biceps focused workout',
        exercises: [
          { exerciseId: 'deadlift', exerciseName: 'Deadlift', plannedSets: 4, plannedReps: 6, plannedWeight: 120, restTime: 150, notes: 'Focus on form', order: 1 },
          { exerciseId: 'lat-pulldown', exerciseName: 'Lat Pulldown', plannedSets: 4, plannedReps: 10, plannedWeight: 60, restTime: 90, notes: '', order: 2 },
          { exerciseId: 'barbell-row', exerciseName: 'Barbell Row', plannedSets: 3, plannedReps: 8, plannedWeight: 70, restTime: 90, notes: '', order: 3 },
        ],
        difficulty: 'intermediate',
        estimatedDuration: 75,
        muscleGroups: ['back', 'arms'],
        createdAt: this.baseDate,
        isCustom: false,
      },
      {
        id: 'tanmay-legs',
        name: "Tanmay's Leg Day",
        description: 'Legs and glutes focused workout',
        exercises: [
          { exerciseId: 'squat', exerciseName: 'Squat', plannedSets: 4, plannedReps: 10, plannedWeight: 100, restTime: 120, notes: 'Focus on depth', order: 1 },
          { exerciseId: 'leg-press', exerciseName: 'Leg Press', plannedSets: 3, plannedReps: 12, plannedWeight: 150, restTime: 90, notes: '', order: 2 },
          { exerciseId: 'calf-raise', exerciseName: 'Calf Raise', plannedSets: 4, plannedReps: 15, plannedWeight: 60, restTime: 60, notes: '', order: 3 },
        ],
        difficulty: 'intermediate',
        estimatedDuration: 75,
        muscleGroups: ['legs'],
        createdAt: this.baseDate,
        isCustom: false,
      },
    ];
  }

  private generateAlexRoutines(): WorkoutRoutine[] {
    return [
      {
        id: 'alex-squat-focus',
        name: "Alex's Squat Focus",
        description: 'Heavy squat training with accessories',
        exercises: [
          { exerciseId: 'squat', exerciseName: 'Squat', plannedSets: 5, plannedReps: 3, plannedWeight: 160, restTime: 300, notes: '85% 1RM', order: 1 },
          { exerciseId: 'front-squat', exerciseName: 'Front Squat', plannedSets: 3, plannedReps: 5, plannedWeight: 100, restTime: 180, notes: 'Accessory', order: 2 },
          { exerciseId: 'leg-press', exerciseName: 'Leg Press', plannedSets: 3, plannedReps: 12, plannedWeight: 200, restTime: 120, notes: 'Volume', order: 3 },
        ],
        difficulty: 'advanced',
        estimatedDuration: 90,
        muscleGroups: ['legs'],
        createdAt: this.baseDate,
        isCustom: false,
      },
      {
        id: 'alex-bench-focus',
        name: "Alex's Bench Focus",
        description: 'Heavy bench training with accessories',
        exercises: [
          { exerciseId: 'bench-press', exerciseName: 'Bench Press', plannedSets: 5, plannedReps: 3, plannedWeight: 120, restTime: 300, notes: '85% 1RM', order: 1 },
          { exerciseId: 'incline-db-press', exerciseName: 'Incline Dumbbell Press', plannedSets: 3, plannedReps: 8, plannedWeight: 45, restTime: 120, notes: 'Accessory', order: 2 },
          { exerciseId: 'dips', exerciseName: 'Dips', plannedSets: 3, plannedReps: 10, plannedWeight: 20, restTime: 90, notes: 'Volume', order: 3 },
        ],
        difficulty: 'advanced',
        estimatedDuration: 90,
        muscleGroups: ['chest', 'shoulders', 'arms'],
        createdAt: this.baseDate,
        isCustom: false,
      },
      {
        id: 'alex-deadlift-focus',
        name: "Alex's Deadlift Focus",
        description: 'Heavy deadlift training with accessories',
        exercises: [
          { exerciseId: 'deadlift', exerciseName: 'Deadlift', plannedSets: 5, plannedReps: 1, plannedWeight: 180, restTime: 300, notes: '90% 1RM', order: 1 },
          { exerciseId: 'barbell-row', exerciseName: 'Barbell Row', plannedSets: 4, plannedReps: 6, plannedWeight: 90, restTime: 120, notes: 'Accessory', order: 2 },
          { exerciseId: 'lat-pulldown', exerciseName: 'Lat Pulldown', plannedSets: 3, plannedReps: 10, plannedWeight: 80, restTime: 90, notes: 'Volume', order: 3 },
        ],
        difficulty: 'advanced',
        estimatedDuration: 90,
        muscleGroups: ['back', 'legs'],
        createdAt: this.baseDate,
        isCustom: false,
      },
      {
        id: 'alex-accessories',
        name: "Alex's Accessories",
        description: 'Accessory movements for weak points',
        exercises: [
          { exerciseId: 'overhead-press', exerciseName: 'Overhead Press', plannedSets: 4, plannedReps: 8, plannedWeight: 70, restTime: 120, notes: 'Build shoulders', order: 1 },
          { exerciseId: 'close-grip-bench', exerciseName: 'Close Grip Bench', plannedSets: 3, plannedReps: 10, plannedWeight: 80, restTime: 90, notes: 'Tricep focus', order: 2 },
          { exerciseId: 'face-pull', exerciseName: 'Face Pull', plannedSets: 3, plannedReps: 15, plannedWeight: 30, restTime: 60, notes: 'Rear delts', order: 3 },
        ],
        difficulty: 'advanced',
        estimatedDuration: 75,
        muscleGroups: ['shoulders', 'arms'],
        createdAt: this.baseDate,
        isCustom: false,
      },
    ];
  }

  private generateMayaRoutines(): WorkoutRoutine[] {
    return [
      {
        id: 'maya-full-body',
        name: "Maya's Full Body Beginner",
        description: 'Complete beginner-friendly full body workout',
        exercises: [
          { exerciseId: 'bodyweight-squat', exerciseName: 'Bodyweight Squat', plannedSets: 3, plannedReps: 12, plannedWeight: 0, restTime: 60, notes: 'Focus on form', order: 1 },
          { exerciseId: 'push-up', exerciseName: 'Push-up', plannedSets: 3, plannedReps: 8, plannedWeight: 0, restTime: 60, notes: 'Knee push-ups if needed', order: 2 },
          { exerciseId: 'dumbbell-press', exerciseName: 'Dumbbell Press', plannedSets: 3, plannedReps: 10, plannedWeight: 12, restTime: 60, notes: 'Light weight', order: 3 },
        ],
        difficulty: 'beginner',
        estimatedDuration: 45,
        muscleGroups: ['chest', 'legs', 'shoulders'],
        createdAt: this.baseDate,
        isCustom: false,
      },
    ];
  }

  private generateEmmaRoutines(): WorkoutRoutine[] {
    return [
      {
        id: 'emma-stress-relief',
        name: "Emma's Stress Relief",
        description: 'Moderate intensity workout for stress management',
        exercises: [
          { exerciseId: 'leg-press', exerciseName: 'Leg Press', plannedSets: 3, plannedReps: 15, plannedWeight: 70, restTime: 60, notes: 'Controlled pace', order: 1 },
          { exerciseId: 'chest-press', exerciseName: 'Chest Press', plannedSets: 3, plannedReps: 12, plannedWeight: 30, restTime: 60, notes: 'Focus on breathing', order: 2 },
          { exerciseId: 'cable-row', exerciseName: 'Cable Row', plannedSets: 3, plannedReps: 12, plannedWeight: 35, restTime: 60, notes: 'Posture focus', order: 3 },
        ],
        difficulty: 'intermediate',
        estimatedDuration: 60,
        muscleGroups: ['legs', 'chest', 'back'],
        createdAt: this.baseDate,
        isCustom: false,
      },
      {
        id: 'emma-cardio',
        name: "Emma's Cardio Mix",
        description: 'Low-impact cardio for heart health and stress relief',
        exercises: [
          { exerciseId: 'elliptical', exerciseName: 'Elliptical', plannedSets: 1, plannedReps: 20, plannedWeight: 0, restTime: 0, notes: '20 minutes steady state', order: 1 },
          { exerciseId: 'stationary-bike', exerciseName: 'Stationary Bike', plannedSets: 1, plannedReps: 15, plannedWeight: 0, restTime: 0, notes: '15 minutes intervals', order: 2 },
          { exerciseId: 'walking', exerciseName: 'Treadmill Walk', plannedSets: 1, plannedReps: 10, plannedWeight: 0, restTime: 0, notes: '10 minutes cooldown', order: 3 },
        ],
        difficulty: 'beginner',
        estimatedDuration: 45,
        muscleGroups: ['cardio'],
        createdAt: this.baseDate,
        isCustom: false,
      },
      {
        id: 'emma-strength',
        name: "Emma's Strength Circuit",
        description: 'Circuit training for functional strength',
        exercises: [
          { exerciseId: 'shoulder-press', exerciseName: 'Shoulder Press', plannedSets: 3, plannedReps: 12, plannedWeight: 18, restTime: 45, notes: 'Dumbbells', order: 1 },
          { exerciseId: 'lat-pulldown', exerciseName: 'Lat Pulldown', plannedSets: 3, plannedReps: 12, plannedWeight: 40, restTime: 45, notes: 'Wide grip', order: 2 },
          { exerciseId: 'leg-curl', exerciseName: 'Leg Curl', plannedSets: 3, plannedReps: 15, plannedWeight: 25, restTime: 45, notes: 'Hamstring focus', order: 3 },
        ],
        difficulty: 'intermediate',
        estimatedDuration: 50,
        muscleGroups: ['shoulders', 'back', 'legs'],
        createdAt: this.baseDate,
        isCustom: false,
      },
      {
        id: 'emma-flexibility',
        name: "Emma's Flexibility & Recovery",
        description: 'Stretching and mobility for recovery',
        exercises: [
          { exerciseId: 'yoga-flow', exerciseName: 'Yoga Flow', plannedSets: 1, plannedReps: 20, plannedWeight: 0, restTime: 0, notes: '20 minutes flow', order: 1 },
          { exerciseId: 'foam-rolling', exerciseName: 'Foam Rolling', plannedSets: 1, plannedReps: 15, plannedWeight: 0, restTime: 0, notes: 'Full body', order: 2 },
          { exerciseId: 'stretching', exerciseName: 'Static Stretching', plannedSets: 1, plannedReps: 10, plannedWeight: 0, restTime: 0, notes: 'Hold 30s each', order: 3 },
        ],
        difficulty: 'beginner',
        estimatedDuration: 45,
        muscleGroups: ['flexibility'],
        createdAt: this.baseDate,
        isCustom: false,
      },
    ];
  }

  // Generate bundles for each profile
  private generateTanmayBundles(routines: WorkoutRoutine[]): RoutineBundle[] {
    return [
      {
        id: 'tanmay-ppl',
        name: "Tanmay's Push/Pull/Legs",
        description: '6-day split focusing on progressive overload',
        routineSchedule: {
          monday: 'tanmay-push',
          tuesday: 'tanmay-pull',
          wednesday: 'tanmay-legs',
          thursday: 'tanmay-push',
          friday: 'tanmay-pull',
          saturday: 'tanmay-legs',
          sunday: null,
        },
        isDefault: true,
        createdAt: this.baseDate,
        lastModified: this.baseDate,
      },
    ];
  }

  private generateAlexBundles(routines: WorkoutRoutine[]): RoutineBundle[] {
    return [
      {
        id: 'alex-powerlifting',
        name: "Alex's Powerlifting Split",
        description: '4-day powerlifting focused program',
        routineSchedule: {
          monday: 'alex-squat-focus',
          tuesday: null,
          wednesday: 'alex-bench-focus',
          thursday: null,
          friday: 'alex-deadlift-focus',
          saturday: 'alex-accessories',
          sunday: null,
        },
        isDefault: true,
        createdAt: this.baseDate,
        lastModified: this.baseDate,
      },
    ];
  }

  private generateMayaBundles(routines: WorkoutRoutine[]): RoutineBundle[] {
    return [
      {
        id: 'maya-beginner',
        name: "Maya's Beginner Plan",
        description: '3-day full body routine for beginners',
        routineSchedule: {
          monday: 'maya-full-body',
          tuesday: null,
          wednesday: 'maya-full-body',
          thursday: null,
          friday: 'maya-full-body',
          saturday: null,
          sunday: null,
        },
        isDefault: true,
        createdAt: this.baseDate,
        lastModified: this.baseDate,
      },
    ];
  }

  private generateEmmaBundles(routines: WorkoutRoutine[]): RoutineBundle[] {
    return [
      {
        id: 'emma-consistency',
        name: "Emma's Consistency Plan",
        description: '5-day moderate intensity program',
        routineSchedule: {
          monday: 'emma-stress-relief',
          tuesday: 'emma-cardio',
          wednesday: 'emma-strength',
          thursday: 'emma-stress-relief',
          friday: 'emma-flexibility',
          saturday: null,
          sunday: null,
        },
        isDefault: true,
        createdAt: this.baseDate,
        lastModified: this.baseDate,
      },
    ];
  }

  // Generate achievements based on workout history
  private calculateAchievements(workoutHistory: Workout[], experienceLevel: string): Achievement[] {
    const achievements: Achievement[] = [];
    
    // Calculate total volume
    const totalVolume = workoutHistory.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exerciseSum, exercise) => {
        return exerciseSum + exercise.sets.reduce((setSum, set) => {
          return setSum + (set.weight * set.reps);
        }, 0);
      }, 0);
    }, 0);

    // Calculate current streak (simplified)
    const currentStreak = Math.floor(Math.random() * 20) + 1;

    // Experience-based achievements
    if (experienceLevel === 'beginner') {
      achievements.push({
        id: 'first-week',
        title: '🌟 First Week',
        description: 'Completed your first week of workouts!',
        icon: 'star',
        category: 'milestone',
        unlockedAt: new Date(workoutHistory[6]?.date || this.baseDate),
      });
    }

    if (experienceLevel === 'intermediate') {
      achievements.push({
        id: 'week-warrior',
        title: '🔥 Week Warrior',
        description: `${currentStreak} day workout streak!`,
        icon: 'flame',
        category: 'consistency',
        unlockedAt: new Date(),
      });
    }

    if (experienceLevel === 'advanced') {
      achievements.push({
        id: 'iron-mountain',
        title: '🏔️ Iron Mountain',
        description: `Moved ${Math.floor(totalVolume / 1000)}k+ kg total weight!`,
        icon: 'trophy',
        category: 'strength',
        unlockedAt: new Date(),
      });
    }

    // Volume-based achievements
    if (totalVolume >= 10000) {
      achievements.push({
        id: 'volume-master',
        title: '💪 Volume Master',
        description: 'Incredible training volume!',
        icon: 'fitness',
        category: 'volume',
        unlockedAt: new Date(),
      });
    }

    // Workout count achievements
    if (workoutHistory.length >= 50) {
      achievements.push({
        id: 'half-century',
        title: '🎯 Half Century',
        description: '50+ workouts completed!',
        icon: 'medal',
        category: 'milestone',
        unlockedAt: new Date(),
      });
    }

    return achievements;
  }

  // Generate anonymous social comparison data
  private generateSocialData(demographics: UserProfile): AnonymousUserData[] {
    const socialData: AnonymousUserData[] = [];
    
    // Generate 50 anonymous users for comparison
    for (let i = 0; i < 50; i++) {
      const user: AnonymousUserData = {
        id: `anon-${i}`,
        age: demographics.age + Math.floor(Math.random() * 10) - 5, // ±5 years
        weight: demographics.weight + Math.floor(Math.random() * 20) - 10, // ±10 kg
        gender: Math.random() > 0.5 ? demographics.gender : (demographics.gender === 'male' ? 'female' : 'male'),
        experienceLevel: demographics.experienceLevel,
        totalWorkouts: Math.floor(Math.random() * 100) + 10,
        averageVolume: Math.floor(Math.random() * 5000) + 1000,
        joinedDate: new Date(this.baseDate.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      };
      socialData.push(user);
    }
    
    return socialData;
  }
}

export const demoDataService = new DemoDataService(); 