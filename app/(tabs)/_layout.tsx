import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Entypo from '@expo/vector-icons/Entypo';

const handleLogout = async () => {
  try {
    // Clear the JWT token
    await AsyncStorage.removeItem('userToken');
    // Navigate to login
    router.replace('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Recent',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble" color={color} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ paddingHorizontal: 10 }}>
              <Text style={{ color: 'red' }}>Logout</Text>
            </TouchableOpacity>
          ),
          headerShown: true, // Show header for settings to display logout button
        }}
      />

    </Tabs>
  );
}