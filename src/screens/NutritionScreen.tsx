import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import SidebarNav from '../components/SidebarNav';

const NutritionScreen: React.FC = () => {
  console.log('🥗 NutritionScreen - Component mounted');
  
  return (
    <View style={styles.container}>
      <SidebarNav currentRoute="Nutrition" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nutrition</Text>
          <Text style={styles.headerSubtitle}>Track your daily nutrition and fuel your workouts</Text>
        </View>
        <View style={styles.comingSoonContent}>
          <Text style={styles.title}>Nutrition Tracking</Text>
          <Text style={styles.subtitle}>Coming Soon!</Text>
          <Text style={styles.description}>
            Track your daily nutrition intake, calories, macros, and meal planning.
            This feature is in development.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  content: {
    flex: 1,
    paddingTop: 80,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4a5568',
  },
  comingSoonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
  },
  description: {
    fontSize: 14,
    color: '#4a5568',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NutritionScreen; 