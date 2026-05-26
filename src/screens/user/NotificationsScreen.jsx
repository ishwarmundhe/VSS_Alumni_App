import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { ChevronLeft, Bell } from 'lucide-react-native';

export default function NotificationsScreen({ navigation }) {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-[#2E4A8A] px-4 py-4 pt-12 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-white ml-2">
          Notifications
        </Text>
      </View>

      <FlatList
        data={[
          {
            id: '1',
            title: 'System Update',
            msg: 'New features added.',
            time: '1h ago',
          },
        ]}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View className="mx-4 mt-4 p-4 bg-white rounded-xl shadow-sm flex-row">
            <Bell size={20} color="#2E4A8A" />
            <View className="ml-3">
              <Text className="font-bold text-[#1C1C1C]">{item.title}</Text>
              <Text className="text-gray-500 text-sm">{item.msg}</Text>
              <Text className="text-xs text-gray-400 mt-1">{item.time}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
