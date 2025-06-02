import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { storageService } from '../services/storage';
import SidebarNav from '../components/SidebarNav';
import type { RootStackParamList } from '../types';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  if (__DEV__) console.log('⚙️ SettingsScreen - Component mounted');
  
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const clearCustomRoutines = async () => {
    const allRoutines = await storageService.getAllRoutines();
    const customRoutines = allRoutines.filter(r => r.isCustom);
    if (__DEV__) console.log(`⚙️ Found ${customRoutines.length} custom routines to delete`);
    
    for (const routine of customRoutines) {
      await storageService.deleteRoutine(routine.id);
      if (__DEV__) console.log(`✅ Deleted custom routine: ${routine.name}`);
    }
  };

  const clearCustomBundles = async () => {
    const allBundles = await storageService.getAllRoutineBundles();
    const customBundles = allBundles.filter(b => !b.isDefault);
    if (__DEV__) console.log(`⚙️ Found ${customBundles.length} custom bundles to delete`);
    
    for (const bundle of customBundles) {
      await storageService.deleteRoutineBundle(bundle.id);
      if (__DEV__) console.log(`✅ Deleted custom bundle: ${bundle.name}`);
    }
    
    // Reset default bundle
    const defaultBundle = allBundles.find(b => b.isDefault);
    if (defaultBundle) {
      if (__DEV__) console.log(`⚙️ Resetting default bundle: ${defaultBundle.name}`);
      await storageService.deleteRoutineBundle(defaultBundle.id);
      if (__DEV__) console.log(`✅ Default bundle reset`);
    }
  };

  const handleResetPRs = () => {
    if (__DEV__) console.log('⚙️ SettingsScreen - Reset PRs button pressed');
    Alert.alert(
      'Reset Personal Records',
      'This will permanently delete all your personal records. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => { if (__DEV__) console.log('⚙️ PR Reset cancelled'); } },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              if (__DEV__) console.log('⚙️ Starting PR reset process...');
              await storageService.clearAllProgress();
              if (__DEV__) console.log('✅ PR reset completed successfully');
              
              Alert.alert(
                'Success', 
                'All personal records have been reset.',
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    if (__DEV__) console.log('⚙️ Navigating to Home after PR reset');
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Home' }],
                    });
                  }
                }]
              );
            } catch (error) {
              console.error('❌ Reset PRs error:', error);
              Alert.alert('Error', 'Failed to reset personal records.');
            }
          }
        }
      ]
    );
  };

  const handleResetChatHistory = () => {
    if (__DEV__) console.log('⚙️ SettingsScreen - Reset Chat History button pressed');
    Alert.alert(
      'Reset AI Chat History',
      'This will permanently delete your entire conversation history with the AI coach. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => { if (__DEV__) console.log('⚙️ Chat reset cancelled'); } },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              if (__DEV__) console.log('⚙️ Starting chat history reset process...');
              await storageService.clearChatHistory();
              if (__DEV__) console.log('✅ Chat history reset completed successfully');
              
              Alert.alert(
                'Success', 
                'Chat history has been reset.',
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    if (__DEV__) console.log('⚙️ Navigating to Chat after reset');
                    navigation.navigate('Chat');
                  }
                }]
              );
            } catch (error) {
              console.error('❌ Reset chat error:', error);
              Alert.alert('Error', 'Failed to reset chat history.');
            }
          }
        }
      ]
    );
  };

  const handleResetAllWorkouts = () => {
    if (__DEV__) console.log('⚙️ SettingsScreen - Reset All Data button pressed');
    Alert.alert(
      'Reset All Data',
      'This will permanently delete ALL your data: workouts, progress, chat history, AND custom routines. This is a destructive action that cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => { if (__DEV__) console.log('⚙️ Full reset cancelled'); } },
        {
          text: 'I\'m Sure',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will delete EVERYTHING: workouts, progress records, chat history, custom routines, and custom schedules.',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => { if (__DEV__) console.log('⚙️ Final reset cancelled'); } },
                {
                  text: 'DELETE EVERYTHING',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      if (__DEV__) console.log('⚙️ Starting complete data wipe...');
                      
                      await storageService.clearAllWorkouts();
                      if (__DEV__) console.log('✅ Workouts cleared');
                      
                      await storageService.clearAllProgress();
                      if (__DEV__) console.log('✅ Progress records cleared');
                      
                      await storageService.clearChatHistory();
                      if (__DEV__) console.log('✅ Chat history cleared');
                      
                      await clearCustomRoutines();
                      await clearCustomBundles();
                      
                      if (__DEV__) console.log('✅ Complete data wipe finished successfully');
                      
                      Alert.alert(
                        'Success', 
                        'All data has been reset. The app will refresh to default state.',
                        [{ 
                          text: 'OK', 
                          onPress: () => {
                            if (__DEV__) console.log('⚙️ Navigating to Home after complete reset');
                            navigation.reset({
                              index: 0,
                              routes: [{ name: 'Home' }],
                            });
                          }
                        }]
                      );
                    } catch (error) {
                      console.error('❌ Reset all data error:', error);
                      Alert.alert('Error', 'Failed to reset all data.');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    if (__DEV__) console.log('⚙️ SettingsScreen - Export Data button pressed');
    Alert.alert(
      'Export Data',
      'Data export feature is coming soon! This will allow you to backup your workout data.',
      [{ text: 'OK', onPress: () => { if (__DEV__) console.log('⚙️ Export data acknowledged'); } }]
    );
  };

  const handleNotificationToggle = (value: boolean) => {
    if (__DEV__) console.log('⚙️ SettingsScreen - Notifications toggled:', value);
    setNotificationsEnabled(value);
  };

  const handleAutoBackupToggle = (value: boolean) => {
    if (__DEV__) console.log('⚙️ SettingsScreen - Auto backup toggled:', value);
    setAutoBackup(value);
  };

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    dangerous?: boolean;
  }> = ({ icon, title, subtitle, onPress, rightComponent, dangerous = false }) => (
    <TouchableOpacity 
      style={[styles.settingItem, dangerous && styles.dangerousItem]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={dangerous ? '#e53e3e' : '#4a5568'} 
        />
        <View style={styles.settingItemText}>
          <Text style={[styles.settingItemTitle, dangerous && styles.dangerousText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent || (onPress && (
        <Ionicons name="chevron-forward" size={20} color="#cbd5e0" />
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SidebarNav currentRoute="Settings" />
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your gym tracking experience</Text>
        </View>

        <SettingSection title="General">
          <SettingItem
            icon="notifications"
            title="Workout Reminders"
            subtitle="Get notified when it's time to work out"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#e2e8f0', true: '#3182ce' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#cbd5e0'}
              />
            }
          />
          <SettingItem
            icon="cloud-upload"
            title="Auto Backup"
            subtitle="Automatically backup your data"
            rightComponent={
              <Switch
                value={autoBackup}
                onValueChange={handleAutoBackupToggle}
                trackColor={{ false: '#e2e8f0', true: '#3182ce' }}
                thumbColor={autoBackup ? '#ffffff' : '#cbd5e0'}
              />
            }
          />
        </SettingSection>

        <SettingSection title="Data Management">
          <SettingItem
            icon="download"
            title="Export Data"
            subtitle="Download your workout data"
            onPress={handleExportData}
          />
          <SettingItem
            icon="refresh"
            title="Reset Personal Records"
            subtitle="Clear all PR data while keeping workouts"
            onPress={handleResetPRs}
            dangerous
          />
          <SettingItem
            icon="chatbubble"
            title="Reset AI Chat History"
            subtitle="Clear conversation history with AI coach"
            onPress={handleResetChatHistory}
            dangerous
          />
        </SettingSection>

        <SettingSection title="Danger Zone">
          <SettingItem
            icon="trash"
            title="Reset All Data"
            subtitle="Delete everything - workouts, progress, chat history"
            onPress={handleResetAllWorkouts}
            dangerous
          />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Gym Tracker v1.0.0</Text>
          <Text style={styles.footerSubtext}>Built with ❤️ for your fitness journey</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  scrollContent: {
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
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: {
    marginLeft: 16,
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a365d',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: '#4a5568',
  },
  dangerousItem: {
    backgroundColor: '#fef5e7',
  },
  dangerousText: {
    color: '#e53e3e',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#718096',
  },
});

export default SettingsScreen; 