import React from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { ChevronLeft, Bell } from 'lucide-react-native';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View className="flex-1 bg-gray-50">
      {/* Themed Header */}
      <View className="bg-[#2E4A8A] px-4 py-12 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-white ml-2">
          Notifications
        </Text>
      </View>
      <ScrollView className="flex-1 bg-white px-6">
        <View className="py-8">
          <Text className="text-2xl font-bold text-[#1C1C1C] mb-6">
            Privacy Policy
          </Text>

          <Text className="text-sm font-bold text-gray-800 mb-2">
            1. Information Collection
          </Text>
          <Text className="text-sm text-gray-600 mb-4 leading-5">
            We collect information such as your name, mobile number, and
            graduation details to verify your alumni status within Piplon Sports
            and VSS Alumni Connect.
          </Text>

          <Text className="text-sm font-bold text-gray-800 mb-2">
            2. Data Usage
          </Text>
          <Text className="text-sm text-gray-600 mb-4 leading-5">
            Your data is used solely for community engagement, event
            notifications, and member verification. We do not sell your personal
            information to third parties.
          </Text>

          <Text className="text-sm font-bold text-gray-800 mb-2">
            3. Account Security
          </Text>
          <Text className="text-sm text-gray-600 mb-4 leading-5">
            We implement industry-standard security measures to protect your
            account. Please do not share your login credentials with others.
          </Text>

          <Text className="text-xs text-gray-400 mt-10 text-center">
            Last Updated: February 2026
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
