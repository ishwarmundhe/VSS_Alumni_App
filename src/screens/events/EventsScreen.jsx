import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  Search,
  CalendarDays,
  List,
} from 'lucide-react-native';

import { useGetEventsQuery } from '../../api/apiSlice';

const BRAND = '#2563EB';

const EventCard = ({ event, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm"
    activeOpacity={0.75}
  >
    <View className="flex-row justify-between items-start mb-2">
      <View className="flex-1 pr-2">
        <Text
          className="text-base font-bold text-gray-900 mb-1"
          numberOfLines={2}
        >
          {event.event_name}
        </Text>
        {event.event_location ? (
          <View className="flex-row items-center gap-1">
            <MapPin size={13} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
              {event.event_location}
            </Text>
          </View>
        ) : null}
      </View>
      <ChevronRight size={18} color="#D1D5DB" />
    </View>

    <View className="flex-row items-center justify-between border-t border-gray-50 pt-2 mt-1">
      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-1">
          <Calendar size={13} color={BRAND} />
          <Text className="text-xs text-gray-600">{event.date}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Clock size={13} color={BRAND} />
          <Text className="text-xs text-gray-600">{event.time}</Text>
        </View>
      </View>
      {event.is_paid ? (
        <View className="flex-row items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
          <Text className="text-xs font-bold text-green-700">
            ₹{event.registration_fee}
          </Text>
        </View>
      ) : (
        <View className="bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
          <Text className="text-xs font-bold text-blue-600">Free</Text>
        </View>
      )}
    </View>

    {event.host_name ? (
      <View className="flex-row items-center gap-1 mt-2">
        <Users size={12} color="#9CA3AF" />
        <Text className="text-xs text-gray-400">By {event.host_name}</Text>
      </View>
    ) : null}
  </TouchableOpacity>
);

export default function EventsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: events = [], isFetching, refetch } = useGetEventsQuery();

  const upcomingEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return events
      .filter(e => {
        const [y, m, d] = e.date.split('-');
        const isUpcoming = new Date(Number(y), Number(m) - 1, Number(d)) >= now;

        if (!isUpcoming) return false;
        if (!q) return true;

        return (
          e.event_name?.toLowerCase().includes(q) ||
          e.event_location?.toLowerCase().includes(q) ||
          e.host_name?.toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time || '00:00'}`) -
          new Date(`${b.date}T${b.time || '00:00'}`),
      );
  }, [events, searchQuery]);

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView edges={['top']} className="bg-white" />

      {/* Header */}
      <View className="bg-white px-4 pt-3 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-1 -ml-1"
            >
              <ArrowLeft size={24} color="#111" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Events</Text>
          </View>

          {/* Navigates to the isolated Calendar Screen */}
          <View className="flex-row bg-gray-100 rounded-xl p-1 gap-1">
            <View className="px-3 py-1.5 rounded-lg flex-row items-center gap-1.5 bg-white shadow-sm">
              <List size={15} color={BRAND} />
              <Text className="text-xs font-semibold text-blue-600">List</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('EventsCalendar')}
              className="px-3 py-1.5 rounded-lg flex-row items-center gap-1.5"
            >
              <CalendarDays size={15} color="#9CA3AF" />
              <Text className="text-xs font-semibold text-gray-400">
                Calendar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 gap-2">
          <Search size={16} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search events..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 py-2.5 text-sm text-gray-900"
          />
        </View>
      </View>

      {isFetching ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : (
        <FlatList
          data={upcomingEvents}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() =>
                navigation.navigate('EventDetails', { eventId: item.id })
              }
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          ListHeaderComponent={
            upcomingEvents.length > 0 ? (
              <Text className="text-xs font-bold text-gray-400 tracking-widest mb-3 uppercase">
                Upcoming · {upcomingEvents.length}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              <CalendarDays size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 font-semibold">
                No upcoming events
              </Text>
              <Text className="text-gray-300 text-sm mt-1">
                Check back later
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
