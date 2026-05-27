import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Users,
  DollarSign,
  Share2,
  Trash2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import {
  useGetEventByIdQuery,
  useDeleteEventMutation,
} from '../../api/apiSlice';

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params || {};

  const { data: event, isFetching } = useGetEventByIdQuery(eventId);
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const handleDelete = () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteEvent(eventId).unwrap();
            Toast.show({
              type: 'success',
              text1: 'Event Deleted',
              text2: 'The event has been successfully deleted.',
            });
            navigation.goBack();
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: error?.data?.message || 'Failed to delete event',
            });
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleShare = () => {
    if (!event) return;
    Share.share({
      message: `Check out this event: ${event.event_name}\n\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.event_location}`,
      title: event.event_name,
    });
  };

  if (isFetching) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Event not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Banner Image */}
        <ImageBackground
          source={{
            uri: event.banner_url || 'https://via.placeholder.com/400x200',
          }}
          className="w-full h-56 bg-gray-300"
          //defaultSource={require('../../assets/placeholder.png')}
        >
          <SafeAreaView
            edges={['top']}
            className="flex-row justify-between px-4 pt-2"
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-black/50 rounded-full p-2"
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleShare}
                className="bg-black/50 rounded-full p-2"
              >
                <Share2 size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* Event Details */}
        <View className="px-4 py-6">
          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {event.event_name}
          </Text>

          {/* Host */}
          <View className="flex-row items-center gap-2 mb-4">
            <Users size={16} color="#666" />
            <Text className="text-gray-600">Hosted by {event.host_name}</Text>
          </View>

          {/* Key Details Card */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <Calendar size={18} color="#2563EB" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-600">DATE</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {event.date}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <Clock size={18} color="#2563EB" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-600">TIME</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {event.time}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <MapPin size={18} color="#2563EB" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-600">LOCATION</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {event.event_location}
                </Text>
              </View>
            </View>
          </View>

          {/* Registration Fee */}
          {event.is_paid && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <DollarSign size={20} color="#16a34a" />
                  <View>
                    <Text className="text-xs text-green-700 font-semibold">
                      REGISTRATION FEE
                    </Text>
                    <Text className="text-lg font-bold text-green-700">
                      ₹{event.registration_fee}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Description (if available) */}
          {event.description && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                About this event
              </Text>
              <Text className="text-gray-600 leading-6">
                {event.description}
              </Text>
            </View>
          )}

          {/* CTA Buttons */}
          <View className="flex-row gap-3">
            {event.is_paid ? (
              <TouchableOpacity className="flex-1 bg-blue-600 rounded-lg py-3 items-center">
                <Text className="text-white font-semibold">
                  Register - ₹{event.registration_fee}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="flex-1 bg-blue-600 rounded-lg py-3 items-center">
                <Text className="text-white font-semibold">Register</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
