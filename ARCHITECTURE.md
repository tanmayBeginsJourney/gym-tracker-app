# 🏗️ Gym Tracker Architecture Overview

> **Last Updated**: Sprint 2.1 Completion  
> **Purpose**: Quick reference for understanding system structure and relationships

---

## 📱 **Core Application Flow**

```
User Journey: HomeScreen → WorkoutScreen → [RoutineBuilder|BundleManager] → ActiveWorkout → Completion
Data Flow:   storageService ← → React State ← → UI Components
```

## 🗂️ **File Organization by Feature**

### **🏠 Core Navigation & Home**
- `App.tsx` - Root navigation setup
- `src/screens/HomeScreen.tsx` - Dashboard, today's workout, quick stats
- `src/navigation/` - Navigation configuration (if exists)

### **💪 Workout System (Sprint 2.1 Complete)**
- `src/screens/WorkoutScreen.tsx` - Main workout hub, routine browsing
- `src/screens/ActiveWorkoutScreen.tsx` - Live workout logging with set counter
- `src/screens/WorkoutCompletionScreen.tsx` - Post-workout summary

### **🏗️ Routine Management (Sprint 2.1 Complete)**
- `src/screens/RoutineBuilderScreen.tsx` - Create/edit custom routines
- `src/screens/BundleManagerScreen.tsx` - Weekly schedule management
- `src/data/exercises.ts` - Exercise database and default routines

### **💾 Data Layer**
- `src/services/storage.ts` - AsyncStorage wrapper, all CRUD operations
- `src/types/index.ts` - TypeScript interfaces for all data models

### **🤖 AI Integration**
- `src/screens/ChatScreen.tsx` - AI coach interface
- (AI provider integration pending - Sprint 5.x)

---

## 🔗 **Key Data Relationships**

### **Core Types Hierarchy**
```
Exercise (base data)
  ↓
RoutineExercise (exercise + sets/reps/weight config)
  ↓  
WorkoutRoutine (collection of RoutineExercises)
  ↓
RoutineBundle (weekly schedule: day → routineId mapping)
  ↓
Workout (completed session with actual sets/weights)
```

### **Navigation Flow**
```
HomeScreen
├── WorkoutScreen
│   ├── RoutineBuilderScreen (create/edit routines)
│   ├── BundleManagerScreen (weekly scheduling)
│   └── ActiveWorkoutScreen → WorkoutCompletionScreen
├── Progress (Sprint 2.3)
├── Nutrition (Sprint 3.1)
├── ChatScreen (AI Coach)
└── Settings
```

---

## ⚡ **Critical Functions by File**

### **HomeScreen.tsx**
- `loadTodaysRoutine()` - Gets today's workout from default bundle
- `startTodaysWorkout()` - Direct workout initiation from home
- Bundle status display and profile management

### **WorkoutScreen.tsx** 
- `loadData()` - Loads routines, bundles, recent workouts
- `startWorkout(routine)` - Initiates ActiveWorkoutScreen
- Quick actions for routine/bundle creation

### **RoutineBuilderScreen.tsx**
- `saveRoutine()` - Creates/updates custom routines
- `addExercise()` - Exercise selection and configuration
- Exercise reordering and parameter adjustment

### **BundleManagerScreen.tsx** ⚠️ Recently Fixed
- `saveBundle()` - Creates/updates weekly schedules (fixed duplication bug)
- `setDefaultBundle()` - Sets active schedule for HomeScreen
- Day-by-day routine assignment interface

### **ActiveWorkoutScreen.tsx** ⚠️ Recently Fixed  
- `loadPreviousPerformance()` - Smart weight/rep defaults (fixed toString() errors)
- `getCurrentSetText()` - Set counter display (fixed "Set 1 of 0" bug)
- Rest timer and set logging

### **storage.ts**
- `saveRoutine()`, `getAllRoutines()` - Routine CRUD
- `saveRoutineBundle()`, `getDefaultRoutineBundle()` - Bundle CRUD
- `getTodaysRoutine()` - Bundle-based daily routine resolution
- `saveWorkout()`, `getAllWorkouts()` - Workout history

---

## 🚨 **Known Technical Debt**

### **Performance Issues**
- Multiple profile loads on HomeScreen (optimization needed)
- Bundle data reloading on every screen focus

### **Data Inconsistencies**
- Some default routines missing plannedSets/plannedReps values
- Exercise popularity ranking not fully utilized

### **UI/UX Improvements Needed**
- ✅ Fixed: Card sizing and text alignment 
- ✅ Fixed: Bundle editing duplication
- ✅ Fixed: Set counter display errors

---

## 🎯 **Sprint Entry Points for Future Development**

### **Sprint 2.2: Exercise Library Management**
- **Start Here**: `src/data/exercises.ts` - Add custom exercise creation
- **UI Entry**: `RoutineBuilderScreen.tsx:252` - Exercise selection modal
- **New Files Needed**: `ExerciseManagerScreen.tsx`, exercise CRUD in storage.ts

### **Sprint 2.3: Progress Analytics**  
- **Start Here**: Create `src/screens/ProgressScreen.tsx`
- **Data Source**: `storage.ts` - getAllWorkouts() analysis
- **Chart Library**: Consider recharts or react-native-chart-kit

### **Sprint 3.1: Nutrition Tracking**
- **Start Here**: Create `src/screens/NutritionScreen.tsx`
- **New Types**: Food, Meal, DailyNutrition interfaces
- **Integration Point**: HomeScreen for daily nutrition summary

---

## 🔧 **Development Guidelines**

### **File Naming Conventions**
- Screens: `FeatureNameScreen.tsx` (PascalCase)
- Services: `serviceName.ts` (camelCase)  
- Types: `index.ts` (centralized in types folder)
- Data: `dataType.ts` (camelCase, descriptive)

### **Component Structure**
```typescript
// Standard screen structure
export default function ScreenName({ navigation, route }: Props) {
  // 1. State declarations
  // 2. useEffect hooks
  // 3. Helper functions
  // 4. Event handlers
  // 5. Render logic
  // 6. StyleSheet
}
```

### **Error Handling Patterns**
- Always wrap async operations in try-catch
- Use console.log with emoji prefixes for debugging
- Show user-friendly error messages via Alert.alert()

---

## 📈 **Scalability Preparations**

### **For 5x Codebase Growth**
- Implement feature-based folder structure
- Add component library for reusable UI elements
- Consider state management (Redux/Zustand) if React state becomes unwieldy
- Implement proper loading states and error boundaries

### **Documentation Maintenance**
- Update this file with each major feature addition
- Add inline JSDoc comments for complex functions
- Maintain CURRENT_STATE.md with implementation status

---

**🎯 Next Update**: After Sprint 2.2 completion (Exercise Library Management) 