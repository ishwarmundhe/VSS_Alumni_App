import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  ChevronRight,
  Shield,
  User,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
} from 'lucide-react-native';

import { apiSlice } from '../../api/apiSlice';
import { setLogout, selectUserRole } from '../../store/authSlice';
import { useGetCurrentUserQuery } from '../../api/apiSlice';

export default function SettingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const role = useSelector(selectUserRole);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch Current User
  const { data: user, isLoading, isError } = useGetCurrentUserQuery();

  const handleSignOutPress = () => {
    setShowLogoutModal(true);
  };

  const confirmSignOut = async () => {
    setShowLogoutModal(false);
    await AsyncStorage.removeItem('authData');
    dispatch(apiSlice.util.resetApiState());
    dispatch(setLogout());
  };

  // --- REUSABLE, POLISHED MODAL UI ---
  const RenderLogoutModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showLogoutModal}
      onRequestClose={() => setShowLogoutModal(false)}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-5">
        <View className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl items-center">
          {/* Centered Icon */}
          <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
            <LogOut size={28} color="#DC2626" />
          </View>

          {/* Centered Text */}
          <Text className="text-xl font-bold text-[#1C1C1C] mb-2 text-center">
            Sign Out?
          </Text>
          <Text className="text-gray-500 mb-8 leading-5 text-center px-2">
            Are you sure you want to sign out? You will need to login again to
            access your account.
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              onPress={() => setShowLogoutModal(false)}
              className="flex-1 bg-gray-100 py-3.5 rounded-xl"
            >
              <Text className="text-gray-700 font-bold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmSignOut}
              className="flex-1 bg-red-500 py-3.5 rounded-xl shadow-sm flex-row justify-center items-center"
            >
              <Text className="text-white font-bold text-center">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // --- ERROR / LOADING STATES ---
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#1A3673] justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (isError || !user) {
    return (
      <View className="flex-1 bg-[#1A3673] justify-center items-center px-4">
        <Text className="text-white text-center mb-4">
          Failed to load profile.
        </Text>
        <TouchableOpacity
          onPress={handleSignOutPress}
          className="bg-red-500 px-6 py-2 rounded-lg"
        >
          <Text className="text-white font-bold">Sign Out</Text>
        </TouchableOpacity>

        {/* Render the Modal here too just in case */}
        <RenderLogoutModal />
      </View>
    );
  }

  // --- MAIN UI ---
  const batchString =
    user.from_year && user.to_year
      ? `Batch ${user.from_year}-${user.to_year}`
      : 'Batch details pending';

  const MenuItem = ({ icon: Icon, title, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-gray-100"
    >
      <View className="flex-row items-center gap-4">
        <Icon size={22} color="#4B5563" />
        <Text className="text-[#1C1C1C] font-semibold text-base">{title}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3673" />

      {/* Top Blue Section */}
      <View className="bg-[#1A3673] pt-16 pb-20 px-6 relative">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          className="flex-row items-center gap-4"
        >
          <Image
            source={{
              uri: user.profile_image,
            }}
            className="w-16 h-16 rounded-full border-2 border-white bg-gray-300"
          />
          <View>
            <Text className="text-white text-2xl font-bold">
              {user.first_name} {user.last_name}
            </Text>
            <Text className="text-blue-200 text-sm">{batchString}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Menu Card (Overlapping) */}
      <View className="flex-1 px-4 -mt-10">
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          {role === 'ADMIN' && (
            <MenuItem
              icon={Shield}
              title="Admin Dashboard"
              onPress={() => navigation.navigate('Admin')}
            />
          )}

          <MenuItem
            icon={User}
            title="Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />

          <MenuItem
            icon={Bell}
            title="Notifications"
            onPress={() => navigation.navigate('NotificationScreen')}
          />

          <MenuItem
            icon={HelpCircle}
            title="Help & Support"
            onPress={() => navigation.navigate('SupportScreen')}
          />

          <MenuItem
            icon={FileText}
            title="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOutPress}
          className="bg-red-50 py-4 rounded-xl flex-row justify-center items-center gap-2 border border-red-100 mb-6"
        >
          <LogOut size={20} color="#DC2626" />
          <Text className="text-red-600 font-bold text-base">Sign Out</Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-400 text-xs">
          Version 1.0.0 • VSS Alumni Connect
        </Text>
      </View>

      {/* Render Modal */}
      <RenderLogoutModal />
    </View>
  );
}
