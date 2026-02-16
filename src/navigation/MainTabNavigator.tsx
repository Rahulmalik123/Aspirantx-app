import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MarketplaceScreen from '../screens/Marketplace/MarketplaceScreen';
import FeedScreen from '../screens/social/FeedScreen';
import PracticeScreen from '../screens/practice/PracticeScreen';
import { COLORS } from '../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (

    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 0,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          // elevation: 8,
          // shadowColor: '#000',
          // shadowOffset: { width: 0, height: -2 },
          // shadowOpacity: 0.1,
          // shadowRadius: 4,
          height: 60,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FeedTab"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "newspaper" : "newspaper-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PracticeTab"
        component={PracticeScreen}
        options={{
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "book" : "book-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MarketplaceTab"
        component={MarketplaceScreen}
        options={{
          tabBarLabel: 'Marketplace',
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "cart" : "cart-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>


  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default MainTabNavigator;
