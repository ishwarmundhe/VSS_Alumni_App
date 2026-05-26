import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  ChevronRight,
  Search,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useGetEventsQuery } from '../../api/apiSlice';

export default function EventsScreen({ navigation }) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const { data: events = [], isFetching, refetch } = useGetEventsQuery();

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.event_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [events, searchQuery]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
  }, [filteredEvents]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return sortedEvents.filter(event => {
      const eventDate = new Date(`${event.date}T${event.time}`);
      return eventDate >= now;
    });
  }, [sortedEvents]);

  const handleEventPress = eventId => {
    navigation.navigate('EventDetails', { eventId });
  };

  const renderEventCard = ({ item: event }) => (
    <TouchableOpacity
      onPress={() => handleEventPress(event.id)}
      className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {event.event_name}
          </Text>
          <View className="flex-row items-center gap-2">
            <MapPin size={16} color="#666" />
            <Text className="text-sm text-gray-600">
              {event.event_location}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#999" />
      </View>

      <View className="flex-row justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color="#2563EB" />
          <Text className="text-sm text-gray-700">{event.date}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Clock size={16} color="#2563EB" />
          <Text className="text-sm text-gray-700">{event.time}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
        <View className="flex-row items-center gap-2">
          <Users size={14} color="#666" />
          <Text className="text-xs text-gray-600">By {event.host_name}</Text>
        </View>
        {event.is_paid && (
          <View className="flex-row items-center gap-1 bg-green-100 px-2 py-1 rounded">
            <DollarSign size={12} color="#16a34a" />
            <Text className="text-xs font-semibold text-green-700">
              ₹{event.registration_fee}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView edges={['top']} className="flex-0 bg-white" />

      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Events</Text>
          </View>
        </View>

        {/* View Mode Toggle */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`flex-1 py-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-blue-500'
                : 'bg-gray-100 border border-gray-300'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                viewMode === 'list' ? 'text-white' : 'text-gray-700'
              }`}
            >
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('calendar')}
            className={`flex-1 py-2 rounded-lg ${
              viewMode === 'calendar'
                ? 'bg-blue-500'
                : 'bg-gray-100 border border-gray-300'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                viewMode === 'calendar' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3">
          <Search size={18} color="#999" />
          <input
            type="text"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search events..."
            className="flex-1 ml-2 py-2 bg-gray-100 text-gray-900 outline-none"
            style={{ fontFamily: 'sans-serif' }}
          />
        </View>
      </View>

      {/* Content */}
      {isFetching ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          className="flex-1 px-4 py-4"
        >
          {viewMode === 'list' ? (
            <>
              {upcomingEvents.length > 0 ? (
                <>
                  <Text className="text-sm font-semibold text-gray-600 mb-3">
                    UPCOMING ({upcomingEvents.length})
                  </Text>
                  <FlatList
                    scrollEnabled={false}
                    data={upcomingEvents}
                    renderItem={renderEventCard}
                    keyExtractor={item => item.id?.toString()}
                  />
                </>
              ) : (
                <View className="py-12 items-center">
                  <Calendar size={48} color="#999" />
                  <Text className="text-gray-600 mt-4 text-center">
                    No upcoming events
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View className="py-8 items-center">
              <Calendar size={48} color="#2563EB" />
              <Text className="text-gray-700 mt-4 font-semibold">
                Calendar View
              </Text>
              <Text className="text-gray-500 text-sm mt-2 text-center">
                Calendar view coming soon
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
