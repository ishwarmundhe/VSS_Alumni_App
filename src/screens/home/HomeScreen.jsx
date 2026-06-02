import React, { useMemo } from 'react';
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
import { Bell, Calendar, Users, Heart, Award } from 'lucide-react-native';

// Import the API hooks
import {
  useGetCurrentUserQuery,
  useGetAlumniStatsQuery,
  useGetEventsQuery,
  useGetDirectoryUsersQuery,
} from '../../api/apiSlice';

// Helper to format date nicely (e.g., "Sun, Feb 15")
const formatEventDate = dateString => {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-');
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export default function HomeScreen({ navigation }) {
  const nav = screen => navigation.navigate(screen);

  // Fetch Current User Data
  const { data: user, isFetching, refetch } = useGetCurrentUserQuery();
  console.log('Home user data', user);

  const {
    data: stats = { total_count: 0, approved_count: 0, pending_count: 0 },
    refetch: refetchStats,
  } = useGetAlumniStatsQuery();

  const { data: events = [], isFetching: isEventsFetching } =
    useGetEventsQuery();

  const { data: alumni = [] } = useGetDirectoryUsersQuery();
  const AlumniCount = alumni.length || 0;

  // Safely extract user details with fallbacks
  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : 'Alumni';

  const profileImage = useMemo(() => {
    return user?.profile_image
      ? `${user.profile_image}?t=${Date.now()}`
      : 'https://img.magnific.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80';
  }, [user]);

  const batchString =
    user?.from_year && user?.to_year
      ? `Batch ${user.from_year}-${user.to_year}`
      : 'Null';

  const primaryAddress =
    user?.addresses && user?.addresses.length > 0 ? user.addresses[0] : null;
  const locationString = primaryAddress?.city
    ? `${primaryAddress.city}${primaryAddress.state ? `, ${primaryAddress.state.substring(0, 2).toUpperCase()}` : ''}`
    : '-';

  // Filter and sort the top 3 upcoming events
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return events
      .filter(e => {
        const [y, m, d] = e.date.split('-');
        return new Date(Number(y), Number(m) - 1, Number(d)) >= now;
      })
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time || '00:00'}`) -
          new Date(`${b.date}T${b.time || '00:00'}`),
      )
      .slice(0, 3); // Capped at exactly 3 events
  }, [events]);

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
                  {AlumniCount || '-'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => nav('Events')}
              className="flex-1 bg-white rounded-xl p-4 shadow-sm flex-row items-center gap-3"
            >
              <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
                <Calendar size={20} color="#7C3AED" />
              </View>
              <View>
                <Text className="text-xs text-gray-500 font-medium">
                  Upcoming Events
                </Text>
                <Text className="text-lg font-bold text-[#1C1C1C]">
                  {events?.filter(e => {
                    const [y, m, d] = e.date.split('-');
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    return new Date(Number(y), Number(m) - 1, Number(d)) >= now;
                  }).length || '0'}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* 2. DYNAMIC UPCOMING EVENTS SCROLL */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#1C1C1C] text-lg font-bold">
                Featured Events
              </Text>
              <Pressable onPress={() => nav('Events')}>
                <Text className="text-sm text-[#2E4A8A] font-semibold">
                  View All
                </Text>
              </Pressable>
            </View>

            {upcomingEvents.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                // Adds a negative margin trick so the cards scroll seamlessly to the edge of the screen
                className="-mx-6"
                contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
              >
                {upcomingEvents.map(event => (
                  <Pressable
                    key={event.id}
                    onPress={() =>
                      navigation.navigate('EventDetails', { eventId: event.id })
                    }
                    className="bg-[#2E4A8A] rounded-2xl p-6 shadow-md overflow-hidden relative w-[310px]"
                  >
                    {/* Background Pattern */}
                    <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
                    <View className="absolute -left-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />

                    <View className="flex-row items-start justify-between mb-4">
                      <View className="w-10 h-10 bg-white/20 rounded-lg items-center justify-center backdrop-blur-sm">
                        <Calendar size={20} color="#FFFFFF" />
                      </View>
                      <View className="bg-[#1F8F3A] px-3 py-1 rounded-full shadow-sm flex-row items-center gap-1">
                        <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                          {event.is_paid ? 'Paid' : 'Free'}
                        </Text>
                      </View>
                    </View>

                    <Text
                      className="text-white text-xl font-bold mb-1"
                      numberOfLines={1}
                    >
                      {event.event_name}
                    </Text>

                    <Text className="text-blue-100 text-sm mb-4">
                      {formatEventDate(event.date)} •{' '}
                      {event.event_location || 'Location TBA'}
                    </Text>

                    <Text
                      className="text-white/80 text-xs leading-5 bg-black/10 p-2 rounded-lg"
                      numberOfLines={2}
                    >
                      {event.description ||
                        `Join us for ${event.event_name}. Reconnect with old friends and make new connections.`}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Pressable
                onPress={() => nav('Events')}
                className="bg-[#2E4A8A]/90 rounded-2xl p-6 shadow-md items-center justify-center"
              >
                <Calendar
                  size={32}
                  color="#FFFFFF"
                  className="mb-3 opacity-50"
                />
                <Text className="text-white text-center font-semibold">
                  No upcoming events right now.
                </Text>
                <Text className="text-blue-200 text-center text-xs mt-1">
                  Check back later for updates!
                </Text>
              </Pressable>
            )}
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
                  title: 'Events',
                  icon: Calendar,
                  color: '#7C3AED',
                  route: 'Events',
                  bg: 'bg-purple-50',
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
        </View>
      </ScrollView>
    </View>
  );
}
