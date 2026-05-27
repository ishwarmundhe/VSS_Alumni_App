import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // <-- Added import

import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from '../../api/apiSlice';

export default function AdminEventsTab() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Date and Time Picker States
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const [formData, setFormData] = useState({
    event_name: '',
    date: '',
    time: '',
    host_name: '',
    event_location: '',
    is_paid: false,
    registration_fee: 0,
  });

  const { data: events = [], isFetching, refetch } = useGetEventsQuery();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        event_name: event.event_name,
        date: event.date,
        time: event.time,
        host_name: event.host_name,
        event_location: event.event_location,
        is_paid: event.is_paid || false,
        registration_fee: event.registration_fee || 0,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        event_name: '',
        date: '',
        time: '',
        host_name: '',
        event_location: '',
        is_paid: false,
        registration_fee: 0,
      });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingEvent(null);
  };

  // --- Picker Handlers ---
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmDate = selectedDate => {
    // Format to local YYYY-MM-DD to avoid UTC timezone shifts
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');

    setFormData({ ...formData, date: `${year}-${month}-${day}` });
    hideDatePicker();
  };

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleConfirmTime = selectedTime => {
    // Format to HH:MM
    const hours = String(selectedTime.getHours()).padStart(2, '0');
    const minutes = String(selectedTime.getMinutes()).padStart(2, '0');

    setFormData({ ...formData, time: `${hours}:${minutes}` });
    hideTimePicker();
  };
  // -----------------------

  const validateForm = () => {
    if (!formData.event_name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Event name is required',
      });
      return false;
    }
    if (!formData.date.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Event date is required',
      });
      return false;
    }
    if (!formData.time.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Event time is required',
      });
      return false;
    }
    if (!formData.host_name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Host name is required',
      });
      return false;
    }
    if (!formData.event_location.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Event location is required',
      });
      return false;
    }
    if (formData.is_paid && formData.registration_fee <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Registration fee must be greater than 0',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        event_name: formData.event_name,
        date: formData.date,
        time: formData.time,
        host_name: formData.host_name,
        event_location: formData.event_location,
        is_paid: formData.is_paid,
        ...(formData.is_paid && {
          registration_fee: parseInt(formData.registration_fee),
        }),
      };

      console.log('Submitting Event:', payload);

      if (editingEvent) {
        await updateEvent({ eventId: editingEvent.id, ...payload }).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Event updated successfully',
        });
      } else {
        await createEvent(payload).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Event created successfully',
        });
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      console.log('Error submitting event:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Failed to save event',
      });
    }
  };

  const handleDelete = event => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.event_name}"?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteEvent(event.id).unwrap();
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Event deleted successfully',
              });
              refetch();
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
      ],
    );
  };

  const renderEventItem = ({ item: event }) => (
    <View className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">
            {event.event_name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Users size={14} color="#666" />
            <Text className="text-xs text-gray-600">{event.host_name}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-4 mb-3">
        <View className="flex-row items-center gap-1">
          <CalendarIcon size={14} color="#666" />
          <Text className="text-xs text-gray-600">{event.date}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Clock size={14} color="#666" />
          <Text className="text-xs text-gray-600">{event.time}</Text>
        </View>
        <View className="flex-row items-center gap-1 flex-1">
          <MapPin size={14} color="#666" />
          <Text className="text-xs text-gray-600 flex-1" numberOfLines={1}>
            {event.event_location}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
        <View>
          {event.is_paid ? (
            <Text className="text-xs font-semibold text-green-700">
              Paid • ₹{event.registration_fee}
            </Text>
          ) : (
            <Text className="text-xs font-semibold text-blue-700">Free</Text>
          )}
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleOpenModal(event)}
            className="p-2 bg-blue-100 rounded"
          >
            <Edit2 size={16} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(event)}
            disabled={isDeleting}
            className="p-2 bg-red-100 rounded"
          >
            <Trash2 size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-bold text-gray-900">Events</Text>
            <Text className="text-xs text-gray-600 mt-1">
              Total: {events.length}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleOpenModal()}
            className="flex-row items-center gap-2 bg-blue-600 rounded-lg px-4 py-2"
          >
            <Plus size={18} color="#fff" />
            <Text className="text-white font-semibold">New Event</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Events List */}
      {isFetching ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
        >
          {events.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={events}
              renderItem={renderEventItem}
              keyExtractor={item => item.id?.toString()}
            />
          ) : (
            <View className="flex-1 justify-center items-center py-12">
              <CalendarIcon size={48} color="#ccc" />
              <Text className="text-gray-500 mt-4 font-semibold">
                No events yet
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                Create your first event
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Create/Edit Event Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl pt-4 max-h-screen">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center px-4 pb-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView className="px-4 py-4">
              {/* Event Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Event Name *
                </Text>
                <TextInput
                  value={formData.event_name}
                  onChangeText={text =>
                    setFormData({ ...formData, event_name: text })
                  }
                  placeholder="e.g., Alumni Meet 2026"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                  editable={!isCreating && !isUpdating}
                />
              </View>

              {/* Date Picker Button */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </Text>
                <TouchableOpacity
                  onPress={showDatePicker}
                  disabled={isCreating || isUpdating}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                >
                  <Text
                    className={
                      formData.date ? 'text-gray-900' : 'text-gray-400'
                    }
                  >
                    {formData.date || 'Select Date'}
                  </Text>
                  <CalendarIcon size={18} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Time Picker Button */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Time *
                </Text>
                <TouchableOpacity
                  onPress={showTimePicker}
                  disabled={isCreating || isUpdating}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                >
                  <Text
                    className={
                      formData.time ? 'text-gray-900' : 'text-gray-400'
                    }
                  >
                    {formData.time || 'Select Time'}
                  </Text>
                  <Clock size={18} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Host Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Host Name *
                </Text>
                <TextInput
                  value={formData.host_name}
                  onChangeText={text =>
                    setFormData({ ...formData, host_name: text })
                  }
                  placeholder="e.g., Achut Gite"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                  editable={!isCreating && !isUpdating}
                />
              </View>

              {/* Location */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </Text>
                <TextInput
                  value={formData.event_location}
                  onChangeText={text =>
                    setFormData({ ...formData, event_location: text })
                  }
                  placeholder="e.g., Samiti Hall, Pune"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                  editable={!isCreating && !isUpdating}
                />
              </View>

              {/* Is Paid Toggle */}
              <View className="flex-row justify-between items-center bg-gray-50 rounded-lg px-4 py-3 mb-4">
                <Text className="text-sm font-semibold text-gray-700">
                  Is Paid Event?
                </Text>
                <Switch
                  value={formData.is_paid}
                  onValueChange={value =>
                    setFormData({ ...formData, is_paid: value })
                  }
                  disabled={isCreating || isUpdating}
                />
              </View>

              {/* Registration Fee */}
              {formData.is_paid && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Registration Fee (₹) *
                  </Text>
                  <TextInput
                    value={formData.registration_fee.toString()}
                    onChangeText={text =>
                      setFormData({
                        ...formData,
                        registration_fee: text ? parseInt(text) : 0,
                      })
                    }
                    placeholder="500"
                    keyboardType="numeric"
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                    editable={!isCreating && !isUpdating}
                  />
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isCreating || isUpdating}
                className="bg-blue-600 rounded-lg py-3 mb-4 mt-6"
              >
                {isCreating || isUpdating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-center">
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- Date & Time Pickers --- */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={formData.date ? new Date(formData.date) : new Date()}
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={hideTimePicker}
        // Fallback to current time if creating, parse existing if editing
        date={
          formData.time
            ? new Date(`2000-01-01T${formData.time}:00`)
            : new Date()
        }
      />
    </View>
  );
}
