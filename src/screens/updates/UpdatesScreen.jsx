import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'; // 1. Added Image import
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, MessageCircle, Share2,Rocket } from 'lucide-react-native';

export default function UpdatesScreen({ navigation }) {
  const updates = [
    {
      id: 1,
      title: 'New Hostel Wing Completed',
      date: 'Dec 20, 2024',
      category: 'Infrastructure',
      content:
        'We are proud to announce the completion of our new hostel wing, adding capacity for 200 more students.',
      likes: 145,
      comments: 23,
      // 2. Added realistic building image
      image:
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      title: 'Tree Plantation Success',
      date: 'Dec 15, 2024',
      category: 'Social Work',
      content:
        'Alumni volunteers planted over 500 trees in the campus vicinity this weekend.',
      likes: 289,
      comments: 45,
      // 2. Added realistic nature/planting image
      image:
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      title: 'Annual Alumni Meet 2024',
      date: 'Nov 10, 2024',
      category: 'Events',
      content: 'A wonderful evening of networking, nostalgia, and gala dinner.',
      likes: 412,
      comments: 89,
      // 2. Added event image
      image:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <View className="flex-1 bg-[#F2F4F7]">
      <SafeAreaView className="bg-[#2E4A8A]">
        <View className="px-6 py-4 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Updates</Text>
        </View>
      </SafeAreaView>

      <View className="flex-1 relative">
        {/* Dimmed & Disabled ScrollView */}
        <View className="flex-1 opacity-50" pointerEvents="none">
          <ScrollView className="flex-1 px-4 py-4">
            {updates.map(update => (
              <View
                key={update.id}
                className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm"
              >
                <View className="p-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-[#2E4A8A]/10 px-2 py-1 rounded">
                      <Text className="text-[#2E4A8A] text-xs font-medium">
                        {update.category}
                      </Text>
                    </View>
                    <Text className="text-xs text-[#717182]">
                      {update.date}
                    </Text>
                  </View>

                  {/* 3. Replaced generic View with Image component */}
                  <Image
                    source={{ uri: update.image }}
                    className="w-full h-48 bg-gray-200 rounded-lg mb-3"
                    resizeMode="cover"
                  />

                  <Text className="text-[#1C1C1C] font-bold text-lg mb-2">
                    {update.title}
                  </Text>
                  <Text className="text-sm text-[#717182] mb-4 leading-5">
                    {update.content}
                  </Text>

                  <View className="flex-row gap-6 pt-3 border-t border-gray-100">
                    <TouchableOpacity className="flex-row gap-2 items-center">
                      <Heart size={18} color="#717182" />
                      <Text className="text-xs text-[#717182] font-medium">
                        {update.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row gap-2 items-center">
                      <MessageCircle size={18} color="#717182" />
                      <Text className="text-xs text-[#717182] font-medium">
                        {update.comments}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row gap-2 items-center ml-auto">
                      <Share2 size={18} color="#717182" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
      <View
        className="absolute inset-0 justify-center items-center px-6"
        pointerEvents="none"
      >
        {/* Subtle dark backdrop to make the card pop */}
        <View className="absolute inset-0 bg-black/10" />

        {/* Floating Card */}
        <View className="bg-white w-full max-w-sm px-8 py-10 rounded-3xl shadow-2xl items-center border border-gray-100">
          {/* Icon Container with soft background */}
          <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-6 shadow-sm border-4 border-white">
            <Rocket size={48} color="#2E4A8A" strokeWidth={1.5} />
          </View>

          {/* Typography */}
          <Text className="text-[#1C1C1C] text-3xl font-black tracking-wide mb-3 text-center">
            Coming Soon
          </Text>
          <Text className="text-[#717182] text-center leading-relaxed text-base">
            We are building a secure and transparent platform for alumni
            contributions. Stay tuned!
          </Text>

          {/* Decorative Dots */}
          <View className="flex-row gap-2 mt-8">
            <View className="w-2.5 h-2.5 rounded-full bg-[#2E4A8A] opacity-20" />
            <View className="w-2.5 h-2.5 rounded-full bg-[#2E4A8A] opacity-50" />
            <View className="w-2.5 h-2.5 rounded-full bg-[#2E4A8A]" />
          </View>
        </View>
      </View>
    </View>
  );
}
