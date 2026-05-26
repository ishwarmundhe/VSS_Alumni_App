import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  StatusBar,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Phone,
  Timer,
  ShieldCheck,
  LogOut,
  AlertTriangle,
} from 'lucide-react-native';

// Import RTK hook and Redux actions
import { useGetCurrentUserQuery } from '../../api/apiSlice';
import { setLogout, approveUser } from '../../store/authSlice';

export default function PendingApproval() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [activeModal, setActiveModal] = useState(null);

  // 1. Fetch current user data
  const {
    data: user,
    isFetching,
    refetch,
  } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true, // Always fetch when component mounts
  });

  // 2. Refetch automatically every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // 3. Listen for approval status changes
  useEffect(() => {
    if (user && user.status === 'APPROVED') {
      const handleApproval = async () => {
        // Update AsyncStorage so it remembers approval on app restart
        const storedData = await AsyncStorage.getItem('authData');
        if (storedData) {
          const authData = JSON.parse(storedData);
          authData.isApproved = true;
          // Ensure role is correct (ADMIN or ALUMNI)
          authData.role = user.roles?.some(r => r.role === 'ADMIN')
            ? 'ADMIN'
            : 'ALUMNI';
          await AsyncStorage.setItem('authData', JSON.stringify(authData));
        }

        // Dispatch to Redux to instantly switch the RootStack to Main App
        dispatch(approveUser());
      };

      handleApproval();
    }
  }, [user, dispatch]);

  const handleCall = () => {
    Linking.openURL('tel:+919309731788');
  };

  const handleDemoBypassAction = () => {
    setActiveModal(null);
    dispatch(approveUser());
  };

  const handleLogoutAction = async () => {
    setActiveModal(null);
    try {
      await AsyncStorage.removeItem('authData'); // Ensure key matches your login logic
      dispatch(setLogout());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#2E4A8A' }}>
      <StatusBar barStyle="light-content" backgroundColor="#2E4A8A" />

      {/* Header */}
      <View
        className="bg-[#2E4A8A] px-6 pb-6"
        style={{ paddingTop: insets.top + 24 }}
      >
        <View className="w-20 h-20 bg-white rounded-full items-center justify-center mx-auto mb-4">
          <Image
            source={require('../../assets/images/vsslogo.jpg')}
            resizeMode="cover"
            style={{ width: 70, height: 70, borderRadius: 40 }}
          />
        </View>
        <Text className="text-white text-xl text-center font-semibold mb-1">
          Application Submitted
        </Text>
      </View>

      <View className="flex-1 bg-[#F2F4F7]">
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 32, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          // 4. Add Pull-to-Refresh so users can manually check
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor="#2E4A8A"
              colors={['#2E4A8A']}
            />
          }
        >
          {/* Status Card */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
            <View className="w-16 h-16 bg-orange-50 rounded-full items-center justify-center mx-auto mb-4 border border-orange-100 relative">
              <Timer color="#F97316" size={32} />
              {isFetching && (
                <View className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                  <ActivityIndicator size="small" color="#F97316" />
                </View>
              )}
            </View>
            <Text className="text-[#1C1C1C] text-lg font-bold text-center mb-2">
              Pending Verification
            </Text>
            <Text className="text-sm text-[#717182] text-center leading-relaxed">
              Your alumni registration was successful. Our admin team will
              verify your details before granting full access. Pull down to
              refresh your status.
            </Text>
          </View>

          {/* Timeline */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
            <Text className="text-[#2E4A8A] text-base font-bold mb-4">
              Expected Timeline
            </Text>
            <View className="p-4 bg-[#F2F4F7] rounded-lg items-center border border-gray-200">
              <Text className="text-xl text-[#2E4A8A] font-bold mb-1">
                24 - 48 Hours
              </Text>
              <Text className="text-xs text-[#717182]">
                Standard review time
              </Text>
            </View>
          </View>

          {/* Need Help */}
          <View className="bg-[#2E4A8A] rounded-xl p-6 mb-6 shadow-md">
            <Text className="text-white text-base font-bold mb-4">
              Need Help?
            </Text>
            <TouchableOpacity
              onPress={handleCall}
              className="flex-row items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/10"
            >
              <Phone color={'#ffff'} size={20} />
              <View>
                <Text className="text-white text-sm font-medium">
                  Call Support
                </Text>
                <Text className="text-white/75 text-xs">+91 93097 31788</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Demo Bypass Button (Keep for development/testing) */}
          {/* <TouchableOpacity
            onPress={() => setActiveModal('bypass')}
            className="flex-row items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl mb-6 dashed"
          >
            <ShieldCheck size={20} color="#166534" />
            <Text className="text-[#166534] font-bold">
              [DEMO] Bypass Approval
            </Text>
          </TouchableOpacity> */}

          <View className="h-10" />
        </ScrollView>
      </View>

      {/* Logout Footer */}
      <View
        className="bg-white border-t border-gray-200 px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          onPress={() => setActiveModal('logout')}
          className="border border-gray-300 rounded-xl py-3 flex-row justify-center items-center gap-2"
        >
          <LogOut size={18} color="#374151" />
          <Text className="text-center font-medium text-gray-700">Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Logic */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={activeModal !== null}
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <View className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
            <View
              className={`w-12 h-12 rounded-full items-center justify-center mb-4 ${
                activeModal === 'bypass' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {activeModal === 'bypass' ? (
                <ShieldCheck size={24} color="#166534" />
              ) : (
                <AlertTriangle size={24} color="#DC2626" />
              )}
            </View>

            <Text className="text-xl font-bold text-[#1C1C1C] mb-2">
              {activeModal === 'bypass' ? 'Bypass Verification?' : 'Sign Out?'}
            </Text>
            <Text className="text-gray-500 mb-6 leading-5">
              {activeModal === 'bypass'
                ? 'This is a demo feature. It will instantly approve your profile and navigate you to the Home screen.'
                : 'Are you sure you want to sign out? You will need to login again to check your status.'}
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                className="flex-1 bg-gray-100 py-3 rounded-xl"
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  activeModal === 'bypass'
                    ? handleDemoBypassAction
                    : handleLogoutAction
                }
                className={`flex-1 py-3 rounded-xl ${
                  activeModal === 'bypass' ? 'bg-[#1F8F3A]' : 'bg-red-500'
                }`}
              >
                <Text className="text-white font-semibold text-center">
                  {activeModal === 'bypass' ? 'Approve Now' : 'Sign Out'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
