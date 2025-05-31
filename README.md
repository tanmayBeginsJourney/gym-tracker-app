# 🏋️‍♂️ Personal Gym Tracker App

A comprehensive fitness tracking application built with React Native and Expo, featuring AI-powered coaching, complete workout logging, and detailed progress analytics.

## 🎯 Current Features

### ✅ **Phase 1: Core Workout Flow (COMPLETED)**
- **Smart Dashboard**: Day-of-week routine scheduling with workout streak tracking
- **Complete Workout Logging**: Full exercise tracking with sets, reps, and weights
- **Active Workout Experience**: Gym-optimized interface with large buttons and offline capability
- **Motivational System**: Personal record detection, achievement celebrations, and progress tracking
- **AI Coach**: Multi-provider AI system (Ollama/OpenAI/Hugging Face) with intelligent fallbacks
- **Local Data Storage**: All data stored securely on your device with auto-save

### 🚧 **Phase 2: Friction Elimination (In Progress)**
- **Performance Optimization**: Faster app startup and navigation
- **Smart Predictions**: AI-powered weight and rep suggestions
- **Voice Input**: "Log bench press, 3 sets of 8 at 185 pounds"
- **Enhanced Offline**: Complete offline functionality with sync capabilities

### 🔮 **Phase 3: Advanced Analytics & Motivation**
- **Detailed Progress Charts**: Strength progression visualization
- **Nutrition Tracking**: Calorie and macro logging with AI recommendations
- **Achievement System**: Comprehensive fitness milestones and rewards
- **Form Analysis**: Camera-based exercise form checking (future)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or later)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your Android device

### Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd gym_tracker
   npm install
   ```

2. **Start Development Server**
   ```bash
   npx expo start --tunnel
   ```

3. **View on Your Phone**
   - Open Expo Go app on your Android device
   - Scan the QR code from the terminal
   - The app will load instantly on your phone! 📱

4. **PC Testing Options**
   - **Web Version**: `npx expo start --web` for browser preview
   - **Android Studio Emulator**: Install Android Studio and create virtual device
   - **Expo Web**: Real-time preview in browser (some limitations)

## 📱 **Development & Testing**

### Real-time Testing
- **Expo Go**: See changes instantly on your phone as you code
- **Hot Reload**: Modifications appear immediately
- **Error Overlay**: Debug issues directly on device
- **Tunnel Mode**: Access from any network location

### AI Coach Configuration (Optional)

The app includes a multi-provider AI system with automatic fallbacks:

1. **Local Ollama** (Recommended - Free & Private)
   - Install Ollama: https://ollama.ai/
   - Run: `ollama run qwen2.5:7b`
   - Automatically detected when running

2. **OpenAI API** (Paid but excellent)
   - Get API key from OpenAI
   - Update `AI_CONFIG.OPENAI_KEY` in `src/services/aiService.ts`

3. **Hugging Face** (Free tier included)
   - Works out of the box with included token
   - Limited daily usage on free tier

The AI will automatically use the best available provider and fall back gracefully.

## 📁 **Project Structure**

```
gym_tracker/
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/          # Main app screens
│   │   ├── HomeScreen.tsx           # Smart dashboard with routine scheduling
│   │   ├── WorkoutScreen.tsx        # Exercise browsing and routine management
│   │   ├── ActiveWorkoutScreen.tsx  # Core workout logging experience
│   │   ├── WorkoutCompletionScreen.tsx # Post-workout celebration
│   │   ├── ChatScreen.tsx           # AI coach interface
│   │   ├── ProgressScreen.tsx       # Progress analytics (placeholder)
│   │   ├── NutritionScreen.tsx      # Nutrition tracking (placeholder)
│   │   └── SettingsScreen.tsx       # App settings and data management
│   ├── services/         # Data & AI services
│   │   ├── storage.ts    # AsyncStorage wrapper with workout management
│   │   └── aiService.ts  # Multi-provider AI service
│   ├── types/           # TypeScript definitions
│   └── data/            # Default exercises & routines
├── __tests__/           # Test files
├── assets/              # Images & fonts
└── App.tsx             # Main app component
```

## 🔧 **Technology Stack**

- **Frontend**: React Native + Expo (~53.0.9)
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation 7
- **Storage**: AsyncStorage (local device storage)
- **AI**: Multi-provider (Ollama/OpenAI/Hugging Face)
- **Charts**: React Native Chart Kit + SVG
- **Testing**: Jest + React Native Testing Library
- **Version Control**: Git

## 📊 **Data Management**

### Local Storage Architecture
All data is stored locally using AsyncStorage with the following structure:

- **User Profile**: `user_profile` - Personal info, goals, preferences
- **Workouts**: `workout_[timestamp]` - Individual workout sessions
- **Routines**: `routine_[id]` - Workout templates and programs
- **Exercises**: `exercises` - Exercise database with categories
- **Progress**: `progress_[exercise]_[date]` - Performance tracking
- **Chat History**: `chat_history` - AI coach conversations
- **Nutrition**: `nutrition_[date]` - Daily nutrition logs

### Data Export/Import
```typescript
// Export all data (implemented in SettingsScreen)
const dataBackup = await storageService.exportAllData();

// Import data (restore from backup)
await storageService.importData(jsonData);

// Reset specific data types
await storageService.clearWorkouts();
await storageService.clearChatHistory();
```

## 🤖 **AI Coach Features**

### Multi-Provider System
The AI coach uses intelligent provider selection:
1. **Ollama** (local) - Private, fast, no internet required
2. **OpenAI** - High quality responses, requires API key
3. **Hugging Face** - Free tier backup option

### Context-Aware Intelligence
The AI coach has access to:
- Recent workouts (last 14 days)
- Personal records and strength trends
- Workout consistency and streak data
- Nutrition logs and macro trends
- User goals and preferences
- Current time/day context

### Example Interactions
```
You: "How's my progress this week?"
AI: "Great consistency! You've hit the gym 3 times this week. 
     Your bench press increased from 70kg to 72.5kg. Keep it up! 💪"

You: "What should I focus on today?"  
AI: "It's Push Day! Based on your schedule, time for chest and 
     shoulders. Your last push session was strong - aim to match 
     those numbers or go up 2.5kg if you're feeling good."
```

## 🏃‍♂️ **Current Development Status**

### ✅ **Recently Completed**
- Complete workout logging flow with offline capability
- Smart dashboard with day-of-week routine scheduling
- Personal record detection and celebration system
- AI coach improvements with text box positioning fix
- Data reset functionality in settings

### 🎯 **Next Sprint (Phase 2.1)**
- Performance optimization and faster app startup
- Enhanced smart defaults and weight predictions
- Voice input for workout logging
- Advanced progress analytics and charts

### 📈 **Progress Tracking**
- **Total Screens**: 8 main screens (6 functional, 2 placeholders)
- **Core Flow**: 100% complete (Home → Workout → Active → Completion)
- **Data Layer**: Full workout and user management
- **AI Integration**: Multi-provider system with graceful fallbacks
- **Testing**: Expo Go compatible, offline functionality verified

## 🆘 **Troubleshooting**

### Common Issues

**App won't start**: Ensure you're in the correct directory and run `npm install`
**QR code not working**: Try `npx expo start --tunnel` for universal access
**Slow performance**: Clear Metro cache: `npx expo start --clear`
**AI not responding**: Check internet connection, will fallback to local responses

### Development Commands
```bash
npm start                # Start Expo development server
npx expo start --tunnel  # Start with tunnel (works anywhere)
npx expo start --web     # Start web version for PC testing
npx expo start --clear   # Clear Metro bundler cache
```

## 🎖️ **App Achievements**

The app successfully delivers:
- **Sub-15-second set logging** in gym conditions
- **Zero data loss** with comprehensive offline functionality  
- **Motivational experience** with progress celebration
- **Smart automation** with routine scheduling and defaults
- **Professional UI** with consistent design system

**Ready for daily gym use with confidence!** 💪

---

*Built with ❤️ for serious fitness enthusiasts who want technology that enhances rather than complicates their training.* 