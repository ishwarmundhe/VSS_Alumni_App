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
  Image,
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
  Image as ImageIcon,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ImagePicker from 'react-native-image-crop-picker';

import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUploadEventBannerMutation,
} from '../../api/apiSlice';

export default function AdminEventsTab() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [bannerImage, setBannerImage] = useState(null); // Local image URI picked by user

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
  const [uploadEventBanner, { isLoading: isUploadingBanner }] =
    useUploadEventBannerMutation();

  const handleOpenModal = (event = null) => {
    setBannerImage(null); // Reset picked image
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
    setBannerImage(null);
  };

  // --- Picker Handlers ---
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleBannerPick = async () => {
    try {
      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: true,
        width: 800,
        height: 400, // Enforce a 2:1 rectangle aspect ratio for banners
      });
      setBannerImage(image.path);
    } catch (e) {
      if (e.code !== 'E_PICKER_CANCELLED') console.log('Banner pick error:', e);
    }
  };

  const handleConfirmDate = selectedDate => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    setFormData({ ...formData, date: `${year}-${month}-${day}` });
    hideDatePicker();
  };

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleConfirmTime = selectedTime => {
    const hours = String(selectedTime.getHours()).padStart(2, '0');
    const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
    setFormData({ ...formData, time: `${hours}:${minutes}` });
    hideTimePicker();
  };

  const validateForm = () => {
    if (
      !formData.event_name.trim() ||
      !formData.date ||
      !formData.time ||
      !formData.host_name.trim() ||
      !formData.event_location.trim()
    ) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill out all required fields',
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
          registration_fee: parseFloat(formData.registration_fee),
        }),
      };

      let savedEventId;

      if (editingEvent) {
        await updateEvent({ eventId: editingEvent.id, ...payload }).unwrap();
        savedEventId = editingEvent.id;
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Event updated successfully',
        });
      } else {
        const res = await createEvent(payload).unwrap();
        savedEventId = res.event?.id;
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Event created successfully',
        });
      }

      // If user selected a NEW banner, upload it using the savedEventId
      if (bannerImage && savedEventId) {
        try {
          await uploadEventBanner({
            eventId: savedEventId,
            imageUri: bannerImage,
          }).unwrap();
        } catch (bannerError) {
          Toast.show({
            type: 'error',
            text1: 'Banner upload failed',
            text2: 'Event saved, but image failed to upload.',
          });
        }
      }

      handleCloseModal();
      refetch();
    } catch (error) {
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
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
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
                text2: 'Failed to delete event',
              });
            }
          },
        },
      ],
    );
  };

  // ─── UPDATED EVENT CARD ──────────────────────────────────────────────────
  const renderEventItem = ({ item: event }) => (
    <View className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
      {/* Show actual Banner Image if it exists */}
      {event.banner_url ? (
        <Image
          source={{ uri: event.banner_url }}
          className="w-full h-32 bg-gray-200"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-16 bg-blue-50 justify-center items-center">
          <ImageIcon size={24} color="#93c5fd" />
        </View>
      )}

      <View className="p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-2">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {event.event_name}
            </Text>
            <View className="flex-row items-center gap-1">
              <Users size={14} color="#666" />
              <Text className="text-xs text-gray-600">
                By {event.host_name}
              </Text>
            </View>
          </View>

          <View className="items-end">
            {event.is_paid ? (
              <View className="bg-green-50 px-2 py-1 rounded border border-green-100">
                <Text className="text-xs font-bold text-green-700">
                  ₹{event.registration_fee}
                </Text>
              </View>
            ) : (
              <View className="bg-blue-50 px-2 py-1 rounded border border-blue-100">
                <Text className="text-xs font-bold text-blue-700">Free</Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-4 mb-4">
          <View className="flex-row items-center gap-1">
            <CalendarIcon size={14} color="#666" />
            <Text className="text-xs text-gray-600">{event.date}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Clock size={14} color="#666" />
            <Text className="text-xs text-gray-600">{event.time}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1 mb-4">
          <MapPin size={14} color="#666" />
          <Text className="text-xs text-gray-600" numberOfLines={1}>
            {event.event_location}
          </Text>
        </View>

        <View className="flex-row gap-2 border-t border-gray-100 pt-3">
          <TouchableOpacity
            onPress={() => handleOpenModal(event)}
            className="flex-1 py-2 bg-blue-50 rounded items-center flex-row justify-center gap-2"
          >
            <Edit2 size={16} color="#2563EB" />
            <Text className="text-blue-600 font-medium">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(event)}
            disabled={isDeleting}
            className="py-2 px-4 bg-red-50 rounded items-center"
          >
            <Trash2 size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
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

      {isFetching ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          className="flex-1 px-4 py-4"
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id?.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            events.length === 0
              ? { flex: 1, justifyContent: 'center' }
              : { paddingBottom: 40 }
          }
          ListEmptyComponent={
            <View className="items-center py-12">
              <CalendarIcon size={48} color="#ccc" />
              <Text className="text-gray-500 mt-4 font-semibold">
                No events yet
              </Text>
            </View>
          }
        />
      )}

      {/* ─── CREATE / EDIT MODAL ──────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl pt-4 max-h-[90%]">
            <View className="flex-row justify-between items-center px-4 pb-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-4 py-4">
              {/* Banner Upload Placed INSIDE the Form */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Event Banner
                </Text>
                <TouchableOpacity
                  onPress={handleBannerPick}
                  className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-1 items-center justify-center min-h-[140px] overflow-hidden"
                >
                  {bannerImage || editingEvent?.banner_url ? (
                    <Image
                      source={{ uri: bannerImage || editingEvent.banner_url }}
                      className="w-full h-32 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="items-center gap-2 py-4">
                      <ImageIcon size={28} color="#9CA3AF" />
                      <Text className="text-gray-400 text-sm">
                        Tap to upload banner
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {bannerImage && (
                  <Text className="text-xs text-blue-600 mt-1 mt-2 text-center">
                    New image selected
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Event Name *
                </Text>
                <TextInput
                  value={formData.event_name}
                  onChangeText={text =>
                    setFormData({ ...formData, event_name: text })
                  }
                  placeholder="e.g., Tech Conference 2026"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                />
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </Text>
                  <TouchableOpacity
                    onPress={showDatePicker}
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
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Time *
                  </Text>
                  <TouchableOpacity
                    onPress={showTimePicker}
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
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Host Name *
                </Text>
                <TextInput
                  value={formData.host_name}
                  onChangeText={text =>
                    setFormData({ ...formData, host_name: text })
                  }
                  placeholder="e.g., Ishwar Mundhe"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </Text>
                <TextInput
                  value={formData.event_location}
                  onChangeText={text =>
                    setFormData({ ...formData, event_location: text })
                  }
                  placeholder="e.g., Pune"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                />
              </View>

              <View className="flex-row justify-between items-center bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 mb-4">
                <Text className="text-sm font-semibold text-gray-700">
                  Paid Event?
                </Text>
                <Switch
                  value={formData.is_paid}
                  onValueChange={value =>
                    setFormData({ ...formData, is_paid: value })
                  }
                />
              </View>

              {formData.is_paid && (
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Registration Fee (₹) *
                  </Text>
                  <TextInput
                    value={formData.registration_fee?.toString()}
                    onChangeText={text =>
                      setFormData({
                        ...formData,
                        registration_fee: text ? parseInt(text) : 0,
                      })
                    }
                    placeholder="e.g., 500"
                    keyboardType="numeric"
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                  />
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isCreating || isUpdating || isUploadingBanner}
                className={`bg-blue-600 rounded-lg py-4 mb-8 ${isCreating || isUpdating || isUploadingBanner ? 'opacity-70' : ''}`}
              >
                {isCreating || isUpdating || isUploadingBanner ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-lg text-center">
                    {editingEvent ? 'Save Changes' : 'Publish Event'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={
          formData.date
            ? new Date(formData.date.replace(/-/g, '/'))
            : new Date()
        }
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={hideTimePicker}
        date={
          formData.time
            ? new Date(`2000-01-01T${formData.time}:00`)
            : new Date()
        }
      />
    </View>
  );
}
