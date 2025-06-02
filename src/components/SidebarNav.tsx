import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

interface SidebarNavProps {
  currentRoute: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ currentRoute }) => {
  console.log('📱 SidebarNav - Component rendered, current route:', currentRoute);
  
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width * 0.8));

  const menuItems = [
    { 
      id: 'Home', 
      label: 'Dashboard', 
      icon: 'home-outline', 
      route: 'Home' as keyof RootStackParamList,
      description: 'Your fitness overview'
    },
    { 
      id: 'Workout', 
      label: 'Workouts', 
      icon: 'fitness-outline', 
      route: 'Workout' as keyof RootStackParamList,
      description: 'Training routines'
    },
    { 
      id: 'Progress', 
      label: 'Progress', 
      icon: 'trending-up-outline', 
      route: 'Progress' as keyof RootStackParamList,
      description: 'Track your gains'
    },
    { 
      id: 'Nutrition', 
      label: 'Nutrition', 
      icon: 'restaurant-outline', 
      route: 'Nutrition' as keyof RootStackParamList,
      description: 'Meal tracking'
    },
    { 
      id: 'Chat', 
      label: 'AI Coach', 
      icon: 'chatbubble-ellipses-outline', 
      route: 'Chat' as keyof RootStackParamList,
      description: 'Personal trainer'
    },
    { 
      id: 'Settings', 
      label: 'Settings', 
      icon: 'settings-outline', 
      route: 'Settings' as keyof RootStackParamList,
      description: 'App preferences'
    },
  ];

  const openSidebar = () => {
    console.log('📱 SidebarNav - Opening sidebar');
    setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    console.log('📱 SidebarNav - Closing sidebar');
    Animated.timing(slideAnim, {
      toValue: -width * 0.8,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setSidebarVisible(false);
  };

  const navigateToScreen = (route: keyof RootStackParamList) => {
    console.log('📱 SidebarNav - Navigating to:', route);
    closeSidebar();
    if (route !== currentRoute) {
      navigation.navigate(route as any);
    }
  };

  const SidebarButton = () => (
    <TouchableOpacity 
      style={styles.sidebarButton} 
      onPress={openSidebar}
      activeOpacity={0.7}
    >
      <Ionicons name="menu" size={24} color="#2d3748" />
    </TouchableOpacity>
  );

  const SidebarContent = () => (
    <Animated.View 
      style={[
        styles.sidebar,
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      <SafeAreaView style={styles.sidebarContent}>
        {/* Header */}
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>💪 Gym Tracker</Text>
          <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#4a5568" />
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                currentRoute === item.route && styles.activeMenuItem
              ]}
              onPress={() => navigateToScreen(item.route)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons 
                  name={item.icon as any} 
                  size={22} 
                  color={currentRoute === item.route ? '#3182ce' : '#4a5568'} 
                />
                <View style={styles.menuItemText}>
                  <Text style={[
                    styles.menuItemLabel,
                    currentRoute === item.route && styles.activeMenuItemLabel
                  ]}>
                    {item.label}
                  </Text>
                  <Text style={styles.menuItemDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
              {currentRoute === item.route && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.sidebarFooter}>
          <Text style={styles.footerText}>Sprint 2.2 Focus</Text>
          <Text style={styles.footerSubtext}>Exercise Library Management</Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );

  return (
    <>
      {/* Sidebar Toggle Button */}
      <SidebarButton />

      {/* Sidebar Modal */}
      <Modal
        visible={sidebarVisible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <View style={styles.modalContainer}>
          {/* Sidebar Content */}
          <SidebarContent />
          
          {/* Backdrop */}
          <TouchableOpacity 
            style={styles.backdrop} 
            onPress={closeSidebar}
            activeOpacity={1}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  sidebarButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: width * 0.8,
    maxWidth: 320,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  closeButton: {
    padding: 4,
  },
  menuSection: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  activeMenuItem: {
    backgroundColor: '#ebf8ff',
    borderRightWidth: 3,
    borderRightColor: '#3182ce',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 2,
  },
  activeMenuItemLabel: {
    color: '#3182ce',
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#718096',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3182ce',
  },
  sidebarFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 2,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#718096',
  },
});

export default SidebarNav; 