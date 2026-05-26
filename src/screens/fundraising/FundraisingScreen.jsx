import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Target,
  Rocket,
} from 'lucide-react-native';
export default function FundraisingScreen({ navigation }) {
  const campaigns = [
    {
      id: 1,
      title: 'New Library Construction',
      description:
        'Help us build a modern library with digital resources for current students',
      target: 5000000,
      raised: 3250000,
      contributors: 234,
      daysLeft: 45,
      category: 'Infrastructure',
    },
    {
      id: 2,
      title: 'Scholarship Fund 2026',
      description: 'Support deserving students with educational scholarships',
      target: 2000000,
      raised: 1850000,
      contributors: 456,
      daysLeft: 15,
      category: 'Education',
    },
  ];

  const formatCurrency = amount => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const getProgress = (raised, target) => Math.round((raised / target) * 100);

  return (
    <View className="flex-1 bg-[#F2F4F7]">
      {/* Header (Fully visible & interactive) */}
      <SafeAreaView className="bg-[#2E4A8A]">
        <View className="px-6 py-4 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Fundraising</Text>
        </View>
      </SafeAreaView>

      {/* Main Content Area Container */}
      <View className="flex-1 relative">
        {/* Dimmed & Disabled ScrollView */}
        <View className="flex-1 opacity-50" pointerEvents="none">
          <ScrollView className="flex-1">
            {/* Stats */}
            <View className="px-6 py-6 bg-white mb-4">
              <Text className="text-[#2E4A8A] text-lg font-bold mb-4">
                Your Impact
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <View className="w-10 h-10 bg-[#1F8F3A]/10 rounded-full items-center justify-center mb-2">
                    <TrendingUp size={20} color="#1F8F3A" />
                  </View>
                  <Text className="text-xs text-[#717182]">Raised</Text>
                  <Text className="text-[#1C1C1C] font-bold">₹62.4L</Text>
                </View>
                <View className="items-center">
                  <View className="w-10 h-10 bg-[#2E4A8A]/10 rounded-full items-center justify-center mb-2">
                    <Users size={20} color="#2E4A8A" />
                  </View>
                  <Text className="text-xs text-[#717182]">Donors</Text>
                  <Text className="text-[#1C1C1C] font-bold">813</Text>
                </View>
                <View className="items-center">
                  <View className="w-10 h-10 bg-[#1F8F3A]/10 rounded-full items-center justify-center mb-2">
                    <Target size={20} color="#1F8F3A" />
                  </View>
                  <Text className="text-xs text-[#717182]">Projects</Text>
                  <Text className="text-[#1C1C1C] font-bold">8</Text>
                </View>
              </View>
            </View>

            {/* Campaigns */}
            <View className="px-6 pb-6">
              <Text className="text-[#2E4A8A] text-lg font-bold mb-4">
                Active Campaigns
              </Text>
              {campaigns.map(camp => (
                <View
                  key={camp.id}
                  className="bg-white rounded-xl p-5 mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-2">
                      <Text className="text-[#1C1C1C] text-lg font-bold mb-1">
                        {camp.title}
                      </Text>
                      <View className="bg-[#2E4A8A]/10 self-start px-2 py-1 rounded">
                        <Text className="text-[#2E4A8A] text-xs">
                          {camp.category}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text className="text-sm text-[#717182] mb-4">
                    {camp.description}
                  </Text>

                  <View className="mb-4">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-sm text-[#1C1C1C]">
                        {formatCurrency(camp.raised)} raised
                      </Text>
                      <Text className="text-sm text-[#717182]">
                        of {formatCurrency(camp.target)}
                      </Text>
                    </View>
                    {/* Progress Bar */}
                    <View className="h-2 bg-[#F2F4F7] rounded-full w-full">
                      <View
                        className="h-2 bg-[#1F8F3A] rounded-full"
                        style={{
                          width: `${getProgress(camp.raised, camp.target)}%`,
                        }}
                      />
                    </View>
                    <View className="flex-row justify-between mt-2">
                      <Text className="text-xs text-[#717182]">
                        {camp.contributors} contributors
                      </Text>
                      <Text className="text-xs text-[#1F8F3A]">
                        {getProgress(camp.raised, camp.target)}% funded
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity className="flex-1 bg-[#1F8F3A] py-3 rounded-lg items-center">
                      <Text className="text-white font-semibold">
                        Donate Now
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 border border-gray-300 py-3 rounded-lg items-center">
                      <Text className="text-[#1C1C1C]">Learn More</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
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
    </View>
  );
}
