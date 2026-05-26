import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  TreePine,
  Users,
  Heart,
  Briefcase,
  CheckCircle2,
  Rocket, // <-- Imported Rocket for the overlay
} from 'lucide-react-native';

export default function VolunteeringScreen({ navigation }) {
  const opportunities = [
    {
      id: 1,
      title: 'Student Career Mentorship',
      description: 'Guide current students in their career paths',
      category: 'Mentorship',
      icon: Users,
      slots: 15,
      volunteers: 8,
      duration: 'Ongoing',
    },
    {
      id: 2,
      title: 'Tree Plantation Drive',
      description: 'Join us in planting trees across nearby villages',
      category: 'Environment',
      icon: TreePine,
      slots: 50,
      volunteers: 32,
      duration: 'Jan 15, 2026',
    },
  ];

  return (
    <View className="flex-1 bg-[#F2F4F7]">
      {/* Header (Fully visible & interactive) */}
      <SafeAreaView className="bg-[#2E4A8A]">
        <View className="px-6 py-4 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Volunteering</Text>
        </View>
      </SafeAreaView>

      {/* Main Content Area Container */}
      <View className="flex-1 relative">
        
        {/* Dimmed & Disabled ScrollView */}
        <View className="flex-1 opacity-50" pointerEvents="none">
          <ScrollView className="flex-1 px-6 py-6">
            {/* Available Opportunities */}
            <Text className="text-[#2E4A8A] text-lg font-bold mb-4">
              Opportunities
            </Text>
            {opportunities.map(opp => {
              const Icon = opp.icon;
              return (
                <View
                  key={opp.id}
                  style={{ borderRadius: 20 }}
                  className="bg-white p-5 mb-4 "
                >
                  <View className="flex-row gap-4 mb-3">
                    <View className="w-12 h-12 bg-[#1F8F3A]/10 rounded-full items-center justify-center">
                      <Icon size={24} color="#1F8F3A" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#1C1C1C] font-bold text-lg">
                        {opp.title}
                      </Text>
                      <View className="bg-[#2E4A8A]/10 self-start px-2 py-1 rounded mt-1">
                        <Text className="text-[#2E4A8A] text-xs">
                          {opp.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text className="text-sm text-[#717182] mb-3">
                    {opp.description}
                  </Text>

                  <View className="flex-row justify-between bg-[#F2F4F7] p-3 rounded-lg mb-4">
                    <Text className="text-xs text-[#717182]">
                      {opp.volunteers} / {opp.slots} volunteers
                    </Text>
                    <Text className="text-xs text-[#1F8F3A]">
                      {opp.slots - opp.volunteers} slots left
                    </Text>
                  </View>

                  <TouchableOpacity className="bg-[#1F8F3A] py-3 rounded-lg items-center">
                    <Text className="text-white font-semibold">Sign Up</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* ================= COMING SOON OVERLAY ================= */}
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
              We are building a dedicated space for alumni to volunteer and give back. Stay tuned!
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
    </View>
  );
}