import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  CalendarDays,
  List,
} from 'lucide-react-native';

import CalendarPicker from 'react-native-calendar-picker';
import { useGetEventsQuery } from '../../api/apiSlice';

const BRAND = '#2563EB';
const DOT_FREE = '#3B82F6';
const DOT_PAID = '#22C55E';
const DOT_MIXED = '#F59E0B';

const toDateStr = date => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

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

const s = StyleSheet.create({
  calendarWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 10,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  selectedLabel: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  selectedLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});

export default function EventsCalendarScreen({ navigation }) {
  const [selectedDateStr, setSelectedDateStr] = useState(toDateStr(new Date()));
  const { data: events = [], isFetching } = useGetEventsQuery();

  const customDatesStyles = useMemo(() => {
    const styles = [];
    const eventDates = [...new Set(events.map(e => e.date))];

    eventDates.forEach(dateStr => {
      const dayEvents = events.filter(e => e.date === dateStr);
      const hasPaid = dayEvents.some(e => e.is_paid);
      const hasFree = dayEvents.some(e => !e.is_paid);

      let bgColor = DOT_FREE;
      if (hasPaid && hasFree) bgColor = DOT_MIXED;
      else if (hasPaid) bgColor = DOT_PAID;

      if (dateStr !== selectedDateStr) {
        const [y, m, d] = dateStr.split('-');
        const safeDate = new Date(
          Number(y),
          Number(m) - 1,
          Number(d),
          12,
          0,
          0,
        );

        styles.push({
          date: safeDate,
          style: { backgroundColor: bgColor, opacity: 0.8 },
          textStyle: { color: '#fff', fontWeight: 'bold' },
        });
      }
    });
    return styles;
  }, [events, selectedDateStr]);

  const eventsOnSelectedDate = useMemo(
    () => events.filter(e => e.date === selectedDateStr),
    [events, selectedDateStr],
  );

  const handleDateChange = date => {
    if (!date) return;
    let dateStr =
      typeof date.format === 'function'
        ? date.format('YYYY-MM-DD')
        : toDateStr(new Date(date));

    InteractionManager.runAfterInteractions(() => {
      setSelectedDateStr(dateStr);
    });
  };

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView edges={['top']} className="bg-white" />

      {/* Header */}
      <View className="bg-white px-4 pt-3 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            {/* Pop back to parent route (MainTabs usually) */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs')}
              className="p-1 -ml-1"
            >
              <ArrowLeft size={24} color="#111" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Events</Text>
          </View>

          {/* Toggle navigates Back to List */}
          <View className="flex-row bg-gray-100 rounded-xl p-1 gap-1">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="px-3 py-1.5 rounded-lg flex-row items-center gap-1.5"
            >
              <List size={15} color="#9CA3AF" />
              <Text className="text-xs font-semibold text-gray-400">List</Text>
            </TouchableOpacity>
            <View className="px-3 py-1.5 rounded-lg flex-row items-center gap-1.5 bg-white shadow-sm">
              <CalendarDays size={15} color={BRAND} />
              <Text className="text-xs font-semibold text-blue-600">
                Calendar
              </Text>
            </View>
          </View>
        </View>
      </View>

      {isFetching ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View>
            <View style={s.calendarWrapper}>
              <CalendarPicker
                onDateChange={handleDateChange}
                selectedStartDate={
                  new Date(
                    Number(selectedDateStr.split('-')[0]),
                    Number(selectedDateStr.split('-')[1]) - 1,
                    Number(selectedDateStr.split('-')[2]),
                    12,
                    0,
                    0,
                  )
                }
                selectedDayColor="#111827"
                selectedDayTextColor="#ffffff"
                todayBackgroundColor="#EFF6FF"
                customDatesStyles={customDatesStyles}
                width={350}
                textStyle={{ color: '#374151', fontSize: 13 }}
                monthTitleStyle={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: '#111827',
                }}
                yearTitleStyle={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: '#111827',
                }}
                previousTitle="Prev"
                nextTitle="Next"
                previousTitleStyle={{ color: BRAND, fontWeight: '600' }}
                nextTitleStyle={{ color: BRAND, fontWeight: '600' }}
              />
            </View>

            <View style={s.legend}>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: DOT_FREE }]} />
                <Text style={s.legendText}>Free</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: DOT_PAID }]} />
                <Text style={s.legendText}>Paid</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: DOT_MIXED }]} />
                <Text style={s.legendText}>Mixed</Text>
              </View>
            </View>

            <View style={s.selectedLabel}>
              <Text style={s.selectedLabelText}>
                {eventsOnSelectedDate.length > 0
                  ? `${eventsOnSelectedDate.length} event${eventsOnSelectedDate.length > 1 ? 's' : ''} · ${selectedDateStr}`
                  : `No events on ${selectedDateStr}`}
              </Text>
            </View>
          </View>

          <View className="px-4 pt-4">
            {eventsOnSelectedDate.length === 0 ? (
              <View className="items-center py-12">
                <Calendar size={40} color="#E5E7EB" />
                <Text className="text-gray-300 mt-3 text-sm">
                  No events on this date
                </Text>
                <Text className="text-gray-200 text-xs mt-1">
                  Tap a highlighted date to see events
                </Text>
              </View>
            ) : (
              eventsOnSelectedDate.map(item => (
                <EventCard
                  key={item.id?.toString()}
                  event={item}
                  onPress={() =>
                    navigation.navigate('EventDetails', { eventId: item.id })
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
