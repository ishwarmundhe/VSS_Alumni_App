import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Calendar,
  TrendingUp,
  Users,
  Heart,
  Award,
  Home,
  User,
  Briefcase,
  ChevronRight,
  Star,
  MapPin,
} from 'lucide-react-native';

// Import the API hook
import {
  useGetCurrentUserQuery,
  useGetAlumniStatsQuery,
} from '../../api/apiSlice';

export default function HomeScreen({ navigation }) {
  const nav = screen => navigation.navigate(screen);

  // Fetch Current User Data
  const { data: user, isFetching, refetch } = useGetCurrentUserQuery();
 const {
   data: stats = { total_count: 0, approved_count: 0, pending_count: 0 },
   refetch: refetchStats,
 } = useGetAlumniStatsQuery();
  
  console.log(stats);


  // Safely extract user details with fallbacks
  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : 'Alumni';
  const profileImage = user?.profile_image || 'https://via.placeholder.com/150';
  const batchString =
    user?.from_year && user?.to_year
      ? `Batch ${user.from_year}-${user.to_year}`
      : 'Batch Pending';

  const primaryAddress =
    user?.addresses && user?.addresses.length > 0 ? user.addresses[0] : null;
  const locationString = primaryAddress?.city
    ? `${primaryAddress.city}${primaryAddress.state ? `, ${primaryAddress.state.substring(0, 2).toUpperCase()}` : ''}`
    : 'Location Pending';

  // Mock data for the new "Jobs" section
  const recentJobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechFlow',
      loc: 'Pune (Hybrid)',
      type: 'Full-time',
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'Zomato',
      loc: 'Bangalore',
      type: 'Remote',
    },
  ];

  return (
    <View className="flex-1 bg-[#2E4A8A]">
      <StatusBar barStyle="light-content" backgroundColor="#2E4A8A" />
      <SafeAreaView edges={['top']} className="flex-0 bg-[#2E4A8A]" />

      <ScrollView
        className="flex-1 bg-[#F2F4F7]"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor="#ffffff"
          />
        }
      >
        {/* ================= HEADER ================= */}
        <View className="bg-[#2E4A8A] px-6 pb-8 rounded-b-3xl pt-2">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => navigation.navigate('EditProfile')}
                className="flex-row items-center gap-4"
              >
                <View className="w-12 h-12 bg-white rounded-full p-0.5 items-center justify-center overflow-hidden border-2 border-white/30">
                  {isFetching && !user ? (
                    <ActivityIndicator size="small" color="#2E4A8A" />
                  ) : (
                    <Image
                      source={{ uri: profileImage }}
                      className="w-full h-full rounded-full bg-gray-200"
                      resizeMode="cover"
                    />
                  )}
                </View>
              </TouchableOpacity>
              <View>
                <Text className="text-sm text-white opacity-90">
                  Welcome back,
                </Text>
                <Text className="text-white text-lg font-bold">{fullName}</Text>
              </View>
            </View>
            <Pressable className="relative bg-white/10 p-2 rounded-full">
              <Bell size={22} color="#FFFFFF" />
              <View className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-[#1F8F3A] rounded-full border border-[#2E4A8A]" />
            </Pressable>
          </View>
          <View className="flex-row items-center gap-2 bg-white/10 self-start px-3 py-1 mb-3 mt-5 rounded-full">
            <Text className="text-xs text-white font-medium">
              {batchString}
            </Text>
            <View className="w-1 h-1 bg-white/50 rounded-full" />
            <Text className="text-xs text-white font-medium">
              {locationString}
            </Text>
          </View>
        </View>

        {/* ================= BODY CONTENT ================= */}
        <View className="px-6 -mt-6 pb-24 gap-6">
          {/* 1. QUICK STATS (Overlapping) */}
          <View className="flex-row gap-4 shadow-lg shadow-blue-900/10">
            <View className="flex-1 bg-white rounded-xl p-4 shadow-sm flex-row items-center gap-3">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                <Users size={20} color="#2E4A8A" />
              </View>
              <View>
                <Text className="text-xs text-gray-500 font-medium">
                  Total Alumni
                </Text>
                <Text className="text-lg font-bold text-[#1C1C1C]">
                  {stats?.total_count || '1001'}
                </Text>
              </View>
            </View>

            <View className="flex-1 bg-white rounded-xl p-4 shadow-sm flex-row items-center gap-3">
              <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
                <Calendar size={20} color="#7C3AED" />
              </View>
              <View>
                <Text className="text-xs text-gray-500 font-medium">
                  Upcoming Events
                </Text>
                <Text className="text-lg font-bold text-[#1C1C1C]">08</Text>
              </View>
            </View>
          </View>

          {/* 2. ALUMNI MEET CARD */}
          <Pressable
            onPress={() => nav('Updates')}
            className="bg-[#2E4A8A] rounded-2xl p-6 shadow-md overflow-hidden relative"
          >
            {/* Background Pattern */}
            <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
            <View className="absolute -left-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />

            <View className="flex-row items-start justify-between mb-4">
              <View className="w-10 h-10 bg-white/20 rounded-lg items-center justify-center backdrop-blur-sm">
                <Calendar size={20} color="#FFFFFF" />
              </View>
              <View className="bg-[#1F8F3A] px-3 py-1 rounded-full shadow-sm">
                <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                  Upcoming
                </Text>
              </View>
            </View>
            <Text className="text-white text-xl font-bold mb-1">
              Annual Alumni Meet 2026
            </Text>
            <Text className="text-blue-100 text-sm mb-4">
              Sunday of February • Pune
            </Text>
            <Text className="text-white/80 text-xs leading-5 bg-black/10 p-2 rounded-lg">
              Join us for our yearly gathering. Reconnect with old friends and
              make new connections.
            </Text>
          </Pressable>

          {/* 3. SAMITI UPDATES */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#1C1C1C] text-lg font-bold">
                Latest Updates
              </Text>
              <Pressable onPress={() => nav('Updates')}>
                <Text className="text-sm text-[#2E4A8A] font-semibold">
                  View All
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => nav('Updates')}
              className="bg-white rounded-xl p-3 flex-row gap-3 shadow-sm border border-gray-100"
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
                }}
                className="w-16 h-16 rounded-lg bg-gray-200"
                resizeMode="cover"
              />
              <View className="flex-1 justify-center">
                <Text className="text-[#1C1C1C] font-bold text-base mb-1">
                  New Hostel Wing
                </Text>
                <Text className="text-xs text-gray-500 mb-1" numberOfLines={1}>
                  Accommodating 50 more students...
                </Text>
                <Text className="text-[10px] text-gray-400 font-medium">
                  2 days ago
                </Text>
              </View>
            </Pressable>
          </View>

          {/* 4. QUICK ACTIONS */}
          <View>
            <Text className="text-[#1C1C1C] text-lg font-bold mb-3">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {[
                {
                  title: 'Directory',
                  icon: Users,
                  color: '#2E4A8A',
                  route: 'Directory',
                  bg: 'bg-blue-50',
                },
                {
                  title: 'Donate',
                  icon: Heart,
                  color: '#EF4444',
                  route: 'Fundraising',
                  bg: 'bg-red-50',
                },
                {
                  title: 'Volunteer',
                  icon: Award,
                  color: '#F59E0B',
                  route: 'Volunteering',
                  bg: 'bg-amber-50',
                },
                {
                  title: 'Community',
                  icon: Users,
                  color: '#10B981',
                  route: 'Community',
                  bg: 'bg-emerald-50',
                },
              ].map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => nav(item.route)}
                  className="bg-white w-[48%] p-4 rounded-xl items-center justify-center shadow-sm border border-gray-100"
                >
                  <View
                    className={`w-12 h-12 rounded-2xl items-center justify-center mb-2 ${item.bg}`}
                  >
                    <item.icon size={22} color={item.color} />
                  </View>
                  <Text className="text-sm font-semibold text-gray-700">
                    {item.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 5. NEW: SPOTLIGHT SECTION */}
          <View>
            <Text className="text-[#1C1C1C] text-lg font-bold mb-3">
              Alumni Spotlight
            </Text>
            <View className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                }}
                className="w-full h-32"
                resizeMode="cover"
              />
              <View className="p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <Text className="text-[#F59E0B] font-bold text-xs uppercase tracking-wide">
                    Achiever of the Month
                  </Text>
                </View>
                <Text className="text-lg font-bold text-[#1C1C1C] mb-1">
                  Priya Sharma
                </Text>
                <Text className="text-gray-500 text-xs mb-3">
                  Batch 2012 • Published new research on AI Ethics
                </Text>
                <Pressable
                  onPress={() => nav('Directory')}
                  className="flex-row items-center"
                >
                  <Text className="text-[#2E4A8A] font-semibold text-sm mr-1">
                    Read Story
                  </Text>
                  <ChevronRight size={14} color="#2E4A8A" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* 6. NEW: RECENT JOBS */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#1C1C1C] text-lg font-bold">
                Recent Opportunities
              </Text>
              <Pressable>
                <Text className="text-sm text-[#2E4A8A] font-semibold">
                  View All
                </Text>
              </Pressable>
            </View>
            <View className="gap-3">
              {recentJobs.map(job => (
                <View
                  key={job.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-row items-center gap-3"
                >
                  <View className="w-10 h-10 bg-gray-50 rounded-lg items-center justify-center border border-gray-100">
                    <Briefcase size={18} color="#4B5563" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-[#1C1C1C]">
                      {job.title}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {job.company} • {job.type}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                    <MapPin size={10} color="#2E4A8A" />
                    <Text className="text-[10px] text-[#2E4A8A] font-medium">
                      {job.loc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
