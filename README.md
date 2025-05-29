# 🏋️‍♂️ Personal Gym Tracker App

A comprehensive fitness tracking application built with React Native and Expo, featuring AI-powered coaching and detailed progress analytics.

## 🎯 Features

### ✅ **Phase 1: Core Features (Current)**
- **Dashboard**: Personal fitness overview with quick stats
- **Workout Logging**: Track exercises, sets, reps, and weights
- **AI Coach**: Context-aware fitness assistant (free Hugging Face API)
- **Local Data Storage**: All data stored securely on your device
- **Progress Tracking**: Visual charts and performance analytics

### 🚧 **Phase 2: Advanced Features (Coming Soon)**
- **Nutrition Tracking**: Calorie and macro logging
- **Comparative Analytics**: Percentile rankings vs age/weight groups  
- **Workout Routines**: Pre-built and custom workout templates
- **Progress Charts**: Detailed visualization of strength gains

### 🔮 **Phase 3: Future Enhancements**
- **Voice Commands**: "Log bench press, 3 sets of 8 at 185 pounds"
- **Form Analysis**: Camera-based exercise form checking
- **Wearable Integration**: Heart rate and activity data sync

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
   npm start
   ```

3. **View on Your Phone**
   - Open Expo Go app on your Android device
   - Scan the QR code from the terminal
   - The app will load instantly on your phone! 📱

4. **Enable AI Coach (Optional)**
   - Get free API key from [Hugging Face](https://huggingface.co/settings/tokens)
   - Replace token in `src/services/aiService.ts`
   - AI will work in fallback mode without the token

## 📱 **Visual Development Process**

### Real-time Testing
- **Expo Go**: See changes instantly on your phone as you code
- **Hot Reload**: Modifications appear immediately
- **Error Overlay**: Debug issues directly on device

### Development Checkpoints

#### ✅ **Checkpoint 1: Foundation Complete**
- [x] Project setup with TypeScript
- [x] Navigation structure (5 tabs)
- [x] Local data storage working
- [x] Git version control initialized

#### ✅ **Checkpoint 2: Core UI Complete**
- [x] Dashboard with stats and recent workouts
- [x] AI Chat interface with context awareness
- [x] Clean, modern UI design
- [x] Component-based architecture

#### 🎯 **Checkpoint 3: Workout Features (Next)**
- [ ] Exercise selection and logging
- [ ] Set/rep/weight tracking
- [ ] Workout timer functionality
- [ ] Routine management

#### 🎯 **Checkpoint 4: Analytics & Progress**
- [ ] Progress visualization charts
- [ ] Personal records tracking
- [ ] Comparative analytics
- [ ] Export/backup functionality

## 🧪 **Testing & Quality**

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --watch       # Watch mode for development
npm test -- --coverage    # Generate coverage report
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Jest**: Unit testing framework
- **Component Testing**: UI component validation

## 📁 **Project Structure**

```
gym_tracker/
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/          # Main app screens
│   ├── services/         # Data & AI services
│   ├── types/           # TypeScript definitions
│   └── data/            # Default exercises & routines
├── __tests__/           # Test files
├── assets/              # Images & fonts
└── App.tsx             # Main app component
```

## 🔧 **Technology Stack**

- **Frontend**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **Storage**: AsyncStorage (local device storage)
- **AI**: Hugging Face Inference API (free tier)
- **Testing**: Jest + React Native Testing Library
- **Version Control**: Git

## 📊 **Data Management**

### Local Storage
All data is stored locally on your device using AsyncStorage:
- **User Profile**: Age, weight, goals, preferences
- **Workouts**: Exercise logs with sets, reps, weights
- **Nutrition**: Meal logs and macro tracking
- **Chat History**: AI coach conversation history
- **Progress**: Historical performance data

### Data Export/Import
```typescript
// Export all data
const dataBackup = await storageService.exportData();

// Import data (restore from backup)
await storageService.importData(jsonData);
```

## 🤖 **AI Coach Features**

### Context-Aware Responses
The AI coach has access to:
- Your recent workouts (last 7 days)
- Nutrition logs and macro trends
- Personal records and strongest lifts
- Fitness goals and preferences
- Total workout count and consistency

### Example Interactions
```
You: "How's my progress?"
AI: "You've completed 15 workouts! Your bench press improved 
     from 60kg to 70kg this month. Great consistency! 💪"

You: "What should I work on today?"  
AI: "Based on your last session being upper body focused, 
     how about some leg work? Your squat could use attention."
```

## 🔄 **Git Workflow**

### Branch Strategy
```bash
main           # Stable releases
├── develop    # Integration branch
├── feature/   # New features
├── bugfix/    # Bug fixes
└── hotfix/    # Critical fixes
```

### Development Process
1. Create feature branch: `git checkout -b feature/workout-logging`
2. Make changes with frequent commits
3. Test on device using Expo Go
4. Merge to develop when complete
5. Deploy to main for releases

## 🚀 **Deployment Options**

### Development (Current)
- Expo Go for instant testing
- Local device storage
- No backend required

### Future Production Options
- **Expo Build**: Standalone APK for Android
- **Google Play Store**: Full distribution
- **Backend**: Firebase or Supabase for cloud sync

## 🆘 **Troubleshooting**

### Common Issues

**Metro bundler won't start**
```bash
npx expo start --clear-cache
```

**TypeScript errors**
```bash
npm run tsc  # Check type errors
```

**App won't load on device**
- Ensure phone and computer are on same WiFi
- Check firewall settings
- Restart Expo Go app

### Getting Help
- Check Expo documentation: https://docs.expo.dev/
- React Native docs: https://reactnative.dev/
- Open GitHub issue for app-specific problems

## 📈 **Performance Monitoring**

### Key Metrics to Track
- App startup time
- Screen transition speed
- Data loading performance
- Memory usage
- Battery impact

### Optimization Techniques
- Image optimization with Expo Image
- Lazy loading for large lists
- Efficient re-renders with React.memo
- Background tasks for data processing

## 🎨 **Design System**

### Color Palette
```typescript
const colors = {
  primary: '#1a365d',      // Deep blue
  secondary: '#3182ce',    // Electric blue  
  accent: '#ff8c00',       // Orange
  background: '#f7fafc',   // Light gray
  white: '#ffffff',
  text: '#4a5568'
}
```

### Typography
- **Headers**: Bold, 20-24px
- **Body**: Regular, 16px
- **Captions**: 12-14px
- **Font**: System default (San Francisco/Roboto)

---

## 🎯 **Current Status: Ready for Development!**

The foundation is complete and working. You can now:

1. ✅ Run the app on your phone via Expo Go
2. ✅ See the dashboard with stats and navigation
3. ✅ Chat with the AI coach (with contextual responses)
4. ✅ Navigate between all 5 main screens
5. 🎯 Start building workout logging features

**Next up**: Building the workout logging functionality in the WorkoutScreen component.

---

*Built with ❤️ for personal fitness tracking* 