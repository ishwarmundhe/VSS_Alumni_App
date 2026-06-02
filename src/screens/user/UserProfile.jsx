import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  Home,
  User as UserIcon,
  Cake,
  ShieldCheck,
} from 'lucide-react-native';

import { useGetUserDetailsQuery } from '../../api/apiSlice';

export default function UserProfile({ navigation, route }) {
  const { userId } = route.params;

  const { data: user, isLoading, isError } = useGetUserDetailsQuery(userId);

  const profileImage = useMemo(() => {
    if (user?.profile_image) {
      return `${user.profile_image}?t=${Date.now()}`;
    }
    return 'https://img.magnific.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80';
  }, [user]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F8F9FA] justify-center items-center">
        <ActivityIndicator size="large" color="#2E4A8A" />
      </View>
    );
  }

  if (isError || !user) {
    return (
      <View className="flex-1 bg-[#F8F9FA] justify-center items-center px-4">
        <Text className="text-red-500 text-center mb-4">
          Failed to load user profile.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-[#2E4A8A] px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Safely extract and format the FULL address
  const primaryAddress =
    user.addresses && user.addresses.length > 0 ? user.addresses[0] : null;
  const addressString = primaryAddress
    ? [
        primaryAddress.house_no,
        primaryAddress.building_name,
        primaryAddress.area_street,
        primaryAddress.landmark,
        primaryAddress.city,
        primaryAddress.district,
        primaryAddress.state,
        primaryAddress.pincode,
      ]
        .filter(Boolean)
        .join(', ')
    : 'Location not provided';

  // Format Birth Date beautifully
  const formattedDob = user.birth_date
    ? new Date(user.birth_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not provided';

  const handleCall = () =>
    Linking.openURL(`tel:${user.country_code}${user.mobile}`);
  const handleEmail = () => Linking.openURL(`mailto:${user.email}`);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" backgroundColor="#2E4A8A" />

      {/* Header */}
      <View className="bg-[#2E4A8A] pt-16 pb-24 px-4 relative">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-16 left-4 z-10"
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-white text-xl font-bold mb-2">
            Alumni Profile
          </Text>
        </View>
      </View>

      {/* Profile Content */}
      <ScrollView
        className="flex-1 -mt-16 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card */}
        <View className="bg-white rounded-2xl p-6 shadow-sm items-center mb-4 mt-10 relative">
          <Image
            source={{ uri: profileImage }}
            className="w-24 h-24 rounded-full border-4 border-white -mt-16 mb-3 bg-gray-200"
            resizeMode="cover"
          />

          <Text className="text-2xl font-bold text-[#1C1C1C] text-center mb-1">
            {user.first_name} {user.middle_name ? `${user.middle_name} ` : ''}
            {user.last_name}
          </Text>

          {/* Role Badge */}
          {user.myapp_role && (
            <View className="bg-blue-50 px-3 py-1 rounded-full flex-row items-center gap-1 mb-2 border border-blue-100">
              <ShieldCheck size={12} color="#2563EB" />
              <Text className="text-blue-600 text-[10px] font-bold tracking-widest uppercase">
                {user.myapp_role}
              </Text>
            </View>
          )}

          <Text className="text-[#2E4A8A] font-semibold text-base mb-1 capitalize text-center">
            {user.designation || user.profession}
          </Text>

          <View className="flex-row items-center gap-1 mb-4">
            <Building size={14} color="#717182" />
            <Text className="text-gray-500 text-sm">
              at {user.company_name}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-4 w-full justify-center">
            <TouchableOpacity
              onPress={handleEmail}
              className="bg-[#2E4A8A] py-2 px-6 rounded-full flex-row items-center gap-2 flex-1 justify-center"
            >
              <Mail size={16} color="white" />
              <Text className="text-white font-medium">Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCall}
              className="border border-gray-300 py-2 px-6 rounded-full flex-row items-center gap-2 flex-1 justify-center"
            >
              <Phone size={16} color="#333" />
              <Text className="text-[#333] font-medium">Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Details */}
        <View className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <Text className="text-lg font-bold text-[#1C1C1C] mb-4">
            Personal Info
          </Text>

          <View className="flex-row items-center gap-3 mb-4">
            <UserIcon size={18} color="#717182" />
            <Text className="text-[#1C1C1C] flex-1 capitalize">
              {user.gender?.toLowerCase() || 'Not specified'}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <Cake size={18} color="#717182" />
            <Text className="text-[#1C1C1C] flex-1">{formattedDob}</Text>
          </View>
        </View>

        {/* Professional Details */}
        <View className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <Text className="text-lg font-bold text-[#1C1C1C] mb-4">
            Samiti & Career
          </Text>

          <View className="flex-row items-start gap-4 mb-4">
            <View className="bg-blue-50 p-2 rounded-lg">
              <Briefcase size={20} color="#2E4A8A" />
            </View>
            <View>
              <Text className="text-gray-500 text-xs">Current Role</Text>
              <Text className="text-[#1C1C1C] font-medium capitalize">
                {user.designation}
              </Text>
              <Text className="text-gray-500 text-sm">{user.company_name}</Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4 mb-4">
            <View className="bg-blue-50 p-2 rounded-lg">
              <Home size={20} color="#2E4A8A" />
            </View>
            <View>
              <Text className="text-gray-500 text-xs">Samiti Hostel</Text>
              <Text className="text-[#1C1C1C] font-medium">
                {user.samiti_hostel_name}
              </Text>
              <Text className="text-gray-500 text-sm">
                {user.duration_of_stay} Years Stay
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4">
            <View className="bg-blue-50 p-2 rounded-lg">
              <Calendar size={20} color="#2E4A8A" />
            </View>
            <View>
              <Text className="text-gray-500 text-xs">Batch Years</Text>
              <Text className="text-[#1C1C1C] font-medium">
                {user.from_year} - {user.to_year}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact & Location */}
        <View className="bg-white rounded-xl p-5 shadow-sm mb-8">
          <Text className="text-lg font-bold text-[#1C1C1C] mb-4">
            Contact & Location
          </Text>

          <View className="flex-row items-start gap-3 mb-4 pr-4">
            <MapPin size={18} color="#717182" className="mt-0.5" />
            <Text className="text-[#1C1C1C] flex-1 leading-5">
              {addressString}
            </Text>
          </View>

          <View className="flex-row items-center gap-3 mb-4">
            <Mail size={18} color="#717182" />
            <Text className="text-[#1C1C1C] flex-1">{user.email}</Text>
          </View>

          <View className="flex-row items-center gap-3">
            <Phone size={18} color="#717182" />
            <Text className="text-[#1C1C1C] flex-1">
              {user.country_code} {user.mobile}
            </Text>
          </View>
        </View>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
