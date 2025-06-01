# 🏗️ Gym Tracker Architecture Overview

> **Last Updated**: Sprint 2.1 Completion (May 2025)  
> **Purpose**: Quick reference for understanding system structure and relationships  
> **Status**: Production-ready with complete custom routine system

---

## 📱 **Core Application Flow**

```
User Journey: HomeScreen → WorkoutScreen → [RoutineBuilder|BundleManager] → ActiveWorkout → Completion
Data Flow:   storageService ← → React State ← → UI Components
Custom Flow: RoutineBuilder → Exercise Selection → Configuration → Bundle Assignment → Workout Execution
```

## 🗂️ **File Organization by Feature**

### **🏠 Core Navigation & Home**
- `App.tsx` - Root navigation setup with stack navigation
- `src/screens/HomeScreen.tsx` - Dashboard, today's workout, quick stats, profile management

### **💪 Workout System (Sprint 2.1 Complete)**
- `src/screens/WorkoutScreen.tsx` - Main workout hub, routine browsing, quick actions
- `src/screens/ActiveWorkoutScreen.tsx` - Live workout logging with set counter
- `src/screens/WorkoutCompletionScreen.tsx` - Post-workout summary and celebration

### **🏗️ Custom Routine Management (Sprint 2.1 Complete)**
- `src/screens/RoutineBuilderScreen.tsx` - Create/edit custom routines with exercise selection
- `src/screens/BundleManagerScreen.tsx` - Weekly schedule management and day assignment
- `src/data/exercises.ts` - Exercise database (30+ exercises) and default routines

### **💾 Data Layer (Enhanced in Sprint 2.1)**
- `src/services/storage.ts` - AsyncStorage wrapper, all CRUD operations, routine/bundle management
- `src/types/index.ts` - TypeScript interfaces for all data models including custom routines

### **🤖 AI Integration (Multi-Provider)**
- `src/screens/ChatScreen.tsx` - AI coach interface with context awareness
- `src/services/aiService.ts` - Multi-provider AI system (Ollama/OpenAI/HuggingFace)

### **📊 Future Development**
- `src/screens/ProgressScreen.tsx` - Progress analytics (Sprint 2.3)
- `src/screens/NutritionScreen.tsx` - Nutrition tracking (Phase 3)

---

## 🔗 **Key Data Relationships**

### **Core Types Hierarchy (Enhanced in Sprint 2.1)**
```
Exercise (base data - 30+ exercises with popularity ranking)
  ↓
RoutineExercise (exercise + sets/reps/weight config + order)
  ↓  
WorkoutRoutine (collection of RoutineExercises + isCustom flag)
  ↓
RoutineBundle (weekly schedule: day → routineId mapping + isDefault)
  ↓
Workout (completed session with actual sets/weights + performance tracking)
```

### **Navigation Flow (Complete in Sprint 2.1)**
```
HomeScreen
├── WorkoutScreen
│   ├── RoutineBuilderScreen (create/edit custom routines)
│   │   └── Exercise Selection Modal (30+ exercises with search)
│   ├── BundleManagerScreen (weekly scheduling with visual calendar)
│   │   └── Routine Assignment Modal (assign routines to days)
│   └── ActiveWorkoutScreen → WorkoutCompletionScreen
├── Progress (Sprint 2.3)
├── Nutrition (Phase 3)
├── ChatScreen (AI Coach with workout context)
└── Settings (data management and export)
```

---

## ⚡ **Critical Functions by File**

### **HomeScreen.tsx (Enhanced in Sprint 2.1)**
- `loadDashboardData()` - Loads profile, today's routine, workout streak
- `createDefaultProfile()` - Auto-creates "Tanmay" profile if none exists
- `startTodaysWorkout()` - Direct workout initiation from home
- Bundle status display and quick action navigation

### **WorkoutScreen.tsx (Major Enhancement in Sprint 2.1)** 
- `loadData()` - Loads routines, bundles, recent workouts with refresh capability
- `startWorkout(routine)` - Initiates ActiveWorkoutScreen with routine data
- Quick actions for routine/bundle creation with visual feedback
- Custom routine display with proper CRUD operations

### **RoutineBuilderScreen.tsx (NEW in Sprint 2.1)**
- `saveRoutine()` - Creates/updates custom routines with validation
- `addExercise()` - Exercise selection with popularity-based sorting
- `removeExercise()` - Exercise removal with confirmation
- Exercise reordering with drag-and-drop functionality
- Exercise parameter adjustment (sets, reps, weight, rest time)

### **BundleManagerScreen.tsx (NEW in Sprint 2.1)**
- `saveBundle()` - Creates/updates weekly schedules with duplicate prevention
- `setDefaultBundle()` - Sets active schedule for HomeScreen integration
- `assignRoutineToDay()` - Day-by-day routine assignment with visual feedback
- Weekly overview with statistics (workout days, rest days, total time)

### **ActiveWorkoutScreen.tsx (Fixes Applied in Sprint 2.1)**  
- `loadPreviousPerformance()` - Smart weight/rep defaults (fixed data access errors)
- `getCurrentSetText()` - Set counter display (fixed "Set 1 of 0" to show planned sets)
- `completeSet()` - Set logging with validation and auto-advance
- Rest timer with manual +/-15 second adjustments

### **storage.ts (Extended in Sprint 2.1)**
- **Routine CRUD**: `saveRoutine()`, `getAllRoutines()`, `deleteRoutine()`
- **Bundle CRUD**: `saveRoutineBundle()`, `getAllRoutineBundles()`, `getDefaultRoutineBundle()`
- **Daily Resolution**: `getTodaysRoutine()` - Bundle-based daily routine resolution
- **Workout Management**: `saveWorkout()`, `getAllWorkouts()` with performance tracking
- **Profile Management**: Auto-creation and retrieval with default values

---

## 🚨 **Technical Debt Status (Post-Sprint 2.1)**

### **Resolved Issues ✅**
- ✅ **UI/UX Inconsistencies**: All header layouts, modal sizing, and touch targets fixed
- ✅ **Bundle Management Bugs**: Duplication and editing issues resolved
- ✅ **Set Counter Errors**: "Set 1 of 0" display fixed across all screens
- ✅ **Profile Loading**: Auto-creation and proper name display implemented
- ✅ **Performance Issues**: Redundant data loading and state management optimized

### **Remaining Technical Debt**
- **Exercise Search Performance**: Need optimization for large custom exercise libraries (Sprint 2.2)
- **Data Migration**: Version management for exercise database updates
- **Chart Library Integration**: Performance evaluation needed for progress analytics (Sprint 2.3)

### **Code Quality Achievements**
- **CodeRabbit Clean**: 0 actionable comments on final review
- **Type Safety**: Complete TypeScript coverage with strict mode
- **Error Handling**: Comprehensive try-catch blocks and user feedback
- **Testing**: Manual testing cycles completed for all workflows

---

## 🎯 **Sprint Entry Points for Development**

### **Sprint 2.2: Exercise Library Management (CURRENT PRIORITY)**
- **Start Here**: `src/data/exercises.ts` - Extend with custom exercise CRUD
- **New Screen**: Create `ExerciseManagerScreen.tsx` for exercise management
- **UI Integration**: Enhance `RoutineBuilderScreen.tsx:252` exercise selection modal
- **Search Implementation**: Add filtering by category, muscle group, equipment
- **Data Model**: Extend Exercise interface with custom fields and user metadata

### **Sprint 2.3: Progress Analytics Foundation**  
- **Start Here**: Create `src/screens/ProgressScreen.tsx` with chart integration
- **Data Source**: `storage.ts.getAllWorkouts()` analysis and aggregation
- **Chart Library**: Implement react-native-chart-kit or react-native-svg-charts
- **Metrics**: Volume tracking, strength progression, consistency analysis

### **Phase 3: Feature Completeness**
- **Nutrition**: Create `src/screens/NutritionScreen.tsx` with macro tracking
- **Performance**: App startup optimization and loading state improvements
- **Onboarding**: Guided setup flow for new users

---

## 🔧 **Development Guidelines (Updated)**

### **File Naming Conventions**
- Screens: `FeatureNameScreen.tsx` (PascalCase)
- Services: `serviceName.ts` (camelCase)  
- Types: `index.ts` (centralized in types folder)
- Data: `dataType.ts` (camelCase, descriptive)

### **Component Structure (Established Pattern)**
```typescript
// Standard screen structure (validated in Sprint 2.1)
export default function ScreenName({ navigation, route }: Props) {
  // 1. State declarations (useState, loading states)
  // 2. useEffect hooks (data loading, focus listeners)
  // 3. Helper functions (data processing, validation)
  // 4. Event handlers (user interactions, navigation)
  // 5. Render logic (conditional rendering, lists)
  // 6. StyleSheet (consistent design system)
}
```

### **Error Handling Patterns (Refined)**
- Always wrap async operations in try-catch with user feedback
- Use emoji-prefixed console.log for debugging: `console.log('🏋️ Starting workout...')`
- Show user-friendly error messages via Alert.alert() with actionable guidance
- Implement graceful degradation for offline scenarios

### **Data Flow Patterns (Proven)**
- Use `useFocusEffect` for screen refresh after navigation
- Implement loading states for all async operations
- Pre-fill forms with previous values or sensible defaults
- Validate user input before save operations

---

## 📈 **Scalability Preparations**

### **Current Architecture Strengths**
- **Modular Screen Design**: Each screen is self-contained with clear responsibilities
- **Centralized Data Layer**: All storage operations go through storage.ts service
- **Type Safety**: Complete TypeScript coverage prevents runtime errors
- **Navigation Clarity**: Stack navigation with proper parameter passing

### **For Future Growth (5x Codebase)**
- **Component Library**: Extract reusable UI components (buttons, modals, cards)
- **State Management**: Consider Redux/Zustand when React state becomes complex
- **Feature Modules**: Group related screens and services into feature folders
- **Testing Framework**: Implement unit and integration tests for critical workflows

### **Documentation Maintenance**
- Update this file after each major sprint completion
- Add JSDoc comments for complex functions and data transformations
- Maintain inline code comments for business logic decisions

---

## 🎯 **Production Readiness Status**

### **Sprint 2.1 Achievements**
- **Complete Custom Routine System**: Users can create unlimited personalized workouts
- **Weekly Bundle Management**: Structured scheduling with visual calendar interface
- **Enhanced User Experience**: All UI/UX issues identified and resolved
- **Production Code Quality**: CodeRabbit approved with 0 actionable comments
- **Manual Testing Complete**: All user workflows validated and functional

### **Ready for Next Phase**
- **Sprint 2.2 Foundation**: Exercise library management architecture ready
- **Data Layer Robust**: Storage system supports advanced features
- **Component Patterns**: Established patterns for rapid development
- **User Experience Excellence**: Professional-grade UI/UX throughout

---

## 💡 **Key Architectural Insights**

### **Design Patterns That Work**
1. **Screen Focus Refresh**: `useFocusEffect` for data consistency across navigation
2. **Modal Architecture**: Centralized modal components with props-based customization
3. **Loading State Management**: Consistent patterns across all async operations
4. **Error Boundary Strategy**: Try-catch at the operation level with user feedback

### **Performance Optimizations**
1. **Conditional Loading**: Prevent redundant data fetching with state checks
2. **Smart Defaults**: Pre-fill forms with historical data for faster user input
3. **Offline-First**: AsyncStorage ensures app functionality without network
4. **Lazy Loading**: Load data only when screens are focused or actions are initiated

---

**🎯 Next Update**: After Sprint 2.2 completion (Exercise Library Management)

*Sprint 2.1 delivered a production-ready custom routine and bundle management system. The architecture now supports unlimited workout customization with professional-grade user experience.* 