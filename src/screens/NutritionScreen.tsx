import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const NutritionScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition Screen</Text>
      <Text style={styles.subtitle}>Fuel your body! 🥗</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
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
});

export default NutritionScreen; 