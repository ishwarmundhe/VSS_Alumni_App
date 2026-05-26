import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Mail, ChevronLeft, Headset } from 'lucide-react-native';

export default function SupportScreen({ navigation }) {
  const supportNumber = '+91 93097 31788';

  return (
    <View className="flex-1 bg-white ">
      <View className="bg-[#2E4A8A] px-4 py-4 flex-row items-center pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-white ml-2">
          Help & Support
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-8">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center">
            <Headset size={40} color="#2E4A8A" />
          </View>
          <Text className="text-lg font-bold text-[#1C1C1C] mt-4">
            How can we help?
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Our support team is available to assist you with your VSS Alumni
            account.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${supportNumber}`)}
          className="bg-white p-5 rounded-2xl flex-row items-center mb-4 shadow-sm border border-gray-100"
        >
          <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
            <Phone size={22} color="#2E4A8A" />
          </View>
          <View className="ml-4">
            <Text className="text-xs text-gray-400 font-medium uppercase">
              Call Support
            </Text>
            <Text className="text-lg font-bold text-[#1C1C1C]">
              {supportNumber}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
