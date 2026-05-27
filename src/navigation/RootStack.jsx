import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditProfileScreen from '../screens/user/EditProfileScreen';
import SupportScreen from '../screens/user/SupportScreen';
import PrivacyPolicyScreen from '../screens/user/PrivacyPolicyScreen';
import NotificationScreen from '../screens/user/NotificationsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { Home, Users, Heart, User, ShieldAlert } from 'lucide-react-native';

import {
  setAuthFromStorage,
  selectIsAuthenticated,
  selectIsProfileComplete,
  selectIsApproved,
  selectUserRole,
} from '../store/authSlice';

// Screens
import SplashScreen from '../screens/splash/SplashScreen';
import Auth from '../screens/auth/Auth';
import ProfileOnboarding from '../screens/onboarding/ProfileOnboarding';
import PendingApproval from '../screens/approval/PendingApproval';
import HomeScreen from '../screens/home/HomeScreen';
import AlumniDirectory from '../screens/directory/AlumniDirectory';
import UserProfile from '../screens/user/UserProfile';
import FundraisingScreen from '../screens/fundraising/FundraisingScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import VolunteeringScreen from '../screens/volunteering/VolunteeringScreen';
import UpdatesScreen from '../screens/updates/UpdatesScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import SettingsScreen from '../screens/user/SettingScreen';
import EventsScreen from '../screens/events/EventsScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const role = useSelector(selectUserRole);
  const insets = useSafeAreaInsets();

  const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 10;

  const tabBarHeight = Platform.OS === 'ios' ? 50 + bottomPadding : 60;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2E4A8A',
        tabBarInactiveTintColor: '#717182',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#F2F4F7',
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Directory"
        component={AlumniDirectory}
        options={{
          tabBarLabel: 'Alumni',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />

      {role === 'ADMIN' && (
        <Tab.Screen
          name="Admin"
          component={AdminDashboard}
          options={{
            tabBarLabel: 'Admin Panel',
            tabBarIcon: ({ color, size }) => (
              <ShieldAlert color={color} size={size} />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
export default function RootStack() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isProfileComplete = useSelector(selectIsProfileComplete);
  const isApproved = useSelector(selectIsApproved);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      const splashTimer = new Promise(resolve => setTimeout(resolve, 2000));
      const loadAuthData = async () => {
        try {
          const authDataString = await AsyncStorage.getItem('authData');
          if (authDataString) {
            const authData = JSON.parse(authDataString);
            dispatch(setAuthFromStorage(authData));
          }
        } catch (error) {
          console.error('Failed to load auth data', error);
        }
      };

      await Promise.all([splashTimer, loadAuthData()]);
      setIsBootstrapping(false);
    };

    initApp();
  }, [dispatch]);

  // 1. Splash
  if (isBootstrapping) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  // 2. Not Logged In
  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={Auth} />
      </Stack.Navigator>
    );
  }

  // 3. Profile Incomplete
  if (!isProfileComplete) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileOnboarding" component={ProfileOnboarding} />
      </Stack.Navigator>
    );
  }

  // 4. Pending Admin Approval
  if (!isApproved) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PendingApproval" component={PendingApproval} />
      </Stack.Navigator>
    );
  }

  // 5. Fully Authorized App
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />

      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="Fundraising" component={FundraisingScreen} />
      <Stack.Screen name="Volunteering" component={VolunteeringScreen} />
      <Stack.Screen name="Updates" component={UpdatesScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen
        name="PrivacyPolicyScreen"
        component={PrivacyPolicyScreen}
      />
      <Stack.Screen name="SupportScreen" component={SupportScreen} />
    </Stack.Navigator>
  );
}
