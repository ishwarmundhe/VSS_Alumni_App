import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Platform,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  Save,
  Camera,
  Image as ImageIcon,
  X,
  Edit3,
  User,
  Briefcase,
  MapPin,
  Home,
  Mail,
  Calendar,
  Building,
  GraduationCap,
} from 'lucide-react-native';

import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useUpdateUserAddressMutation,
  useUpdateAvatarMutation, // 🚨 FIXED: Swapped to the requested hook
} from '../../api/apiSlice';

// --- Validation Helpers ---
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isExact6Digits = val => !val || /^\d{6}$/.test(val);
const isExact4Digits = val => !val || /^\d{4}$/.test(val);

const InputField = ({ label, value, onChangeText, ...props }) => (
  <View className="mb-3">
    <Text className="text-xs text-gray-500 mb-1">{label}</Text>
    <TextInput
      placeholderTextColor="#9CA3AF"
      className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-[#1C1C1C]"
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  </View>
);

const InfoRow = ({ label, value, icon: Icon }) => (
  <View className="flex-row items-center py-3 border-b border-gray-50">
    {Icon && (
      <View className="mr-4 justify-center">
        <Icon size={24} color="#1A3673" strokeWidth={2} />
      </View>
    )}
    <View className="flex-1 justify-center">
      <Text className="text-[11px] uppercase text-gray-400 font-bold tracking-wider mb-0.5">
        {label}
      </Text>
      <Text className="text-[#1C1C1C] text-base font-bold">
        {value || 'Not provided'}
      </Text>
    </View>
  </View>
);

export default function EditProfileScreen({ navigation }) {
  const {
    data: user,
    isLoading: isFetching,
    refetch,
  } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  console.log('update user data', user);

  const [isEditing, setIsEditing] = useState(false);

  const [updateUser, { isLoading: isUpdatingUser }] =
    useUpdateCurrentUserMutation();
  const [updateAddress, { isLoading: isUpdatingAddress }] =
    useUpdateUserAddressMutation();
  const [updateAvatar, { isLoading: isUpdatingImage }] =
    useUpdateAvatarMutation();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [formData, setFormData] = useState({});
  const [addressData, setAddressData] = useState({});
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        birth_date: user.birth_date || '',
        gender: user.gender || 'MALE',
        samiti_hostel_name: user.samiti_hostel_name || '',
        duration_of_stay: user.duration_of_stay
          ? String(user.duration_of_stay)
          : '',
        from_year: user.from_year ? String(user.from_year) : '',
        to_year: user.to_year ? String(user.to_year) : '',
        profession: user.profession || '',
        designation: user.designation || '',
        company_name: user.company_name || '',
      });

      if (user.addresses && user.addresses.length > 0) {
        setAddressData(user.addresses[0]);
      } else {
        setAddressData({
          address_type: 'HOME',
          house_no: '',
          building_name: '',
          area_street: '',
          landmark: '',
          pincode: '',
          city: '',
          district: '',
          state: '',
          country: 'India',
        });
      }
    }
  }, [user]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      setShowDatePicker(false);
      setPickerDate(selectedDate);
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      handleUpdateField('birth_date', `${y}-${m}-${d}`);
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const handleUpdateField = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));
  const handleUpdateAddress = (field, value) =>
    setAddressData(prev => ({ ...prev, [field]: value }));

  const handleCameraLaunch = async () => {
    setShowImagePickerModal(false);
    try {
      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
      });
      setNewProfileImage(image.path);
    } catch (e) {
      if (e.code !== 'E_PICKER_CANCELLED') console.log(e);
    }
  };

  const handleGalleryLaunch = async () => {
    setShowImagePickerModal(false);
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
      });
      setNewProfileImage(image.path);
    } catch (e) {
      if (e.code !== 'E_PICKER_CANCELLED') console.log(e);
    }
  };

  const validateForm = () => {
    if (formData.email && !isValidEmail(formData.email)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Invalid Email Address',
      });
      return false;
    }
    if (addressData.pincode && !isExact6Digits(addressData.pincode)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Pincode must be exactly 6 digits',
      });
      return false;
    }
    if (
      (formData.from_year && !isExact4Digits(formData.from_year)) ||
      (formData.to_year && !isExact4Digits(formData.to_year))
    ) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Years must be exactly 4 digits',
      });
      return false;
    }
    if (
      formData.from_year &&
      formData.to_year &&
      parseInt(formData.to_year) < parseInt(formData.from_year)
    ) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'To Year cannot be before From Year',
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const parsedFromYear = formData.from_year
        ? parseInt(formData.from_year, 10)
        : null;
      const parsedToYear = formData.to_year
        ? parseInt(formData.to_year, 10)
        : null;

      const cleanProfile = {
        first_name: formData.first_name || null,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        birth_date: formData.birth_date || null,
        gender: formData.gender || 'MALE',
        samiti_hostel_name: formData.samiti_hostel_name || null,
        duration_of_stay: formData.duration_of_stay
          ? String(formData.duration_of_stay)
          : null,
        profession: formData.profession || null,
        designation: formData.designation || null,
        company_name: formData.company_name || null,
        from_year: isNaN(parsedFromYear) ? null : parsedFromYear,
        to_year: isNaN(parsedToYear) ? null : parsedToYear,
      };

      await updateUser(cleanProfile).unwrap();

      if (addressData.address_id) {
        try {
          const cleanAddress = {
            addressId: addressData.address_id,
            address_type: addressData.address_type || 'HOME',
            house_no: addressData.house_no || null,
            building_name: addressData.building_name || null,
            area_street: addressData.area_street || null,
            landmark: addressData.landmark || null,
            pincode: addressData.pincode ? String(addressData.pincode) : null,
            city: addressData.city || null,
            district: addressData.district || null,
            state: addressData.state || null,
            country: addressData.country || 'India',
          };
          await updateAddress(cleanAddress).unwrap();
        } catch (addrError) {
          console.warn('Address update failed:', addrError);
        }
      }

      // 🚨 FIXED: Calling updateAvatar directly here
      if (newProfileImage) {
        try {
          await updateAvatar(newProfileImage).unwrap();
        } catch (imgError) {
          console.warn('Avatar update failed:', imgError);
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully!',
      });
      setIsEditing(false);
      setNewProfileImage(null);
      refetch();
    } catch (error) {
      console.error('--- PROFILE UPDATE FAILED ---', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update profile. Please check your inputs.',
      });
    }
  };

  if (isFetching) {
    return (
      <View className="flex-1 bg-[#F8F9FA] justify-center items-center">
        <ActivityIndicator size="large" color="#1A3673" />
      </View>
    );
  }

  const isSaving = isUpdatingUser || isUpdatingAddress || isUpdatingImage;

  const getFullAddress = () => {
    if (!user?.addresses?.[0]) return 'No address set';
    const a = user.addresses[0];
    return [
      a.house_no,
      a.building_name,
      a.area_street,
      a.landmark,
      a.city,
      a.district,
      a.state,
      a.pincode,
    ]
      .filter(Boolean)
      .join(', ');
  };

  // 🚨 UI FIX: Cache bust the old image if returning from backend
  const displayImageUri = newProfileImage
    ? newProfileImage
    : user?.profile_image
      ? `${user.profile_image}?t=${new Date().getTime()}`
      : 'https://via.placeholder.com/150';

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3673" />

      <View className="bg-[#1A3673] pt-14 pb-4 px-4 flex-row items-center justify-between z-10">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() =>
              isEditing ? setIsEditing(false) : navigation.goBack()
            }
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            {isEditing ? 'Edit Profile' : 'Profile'}
          </Text>
        </View>

        {!isEditing ? (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            className="bg-white/20 p-2 rounded-full"
          >
            <Edit3 size={18} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Save size={24} color="white" />
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center pb-8 bg-[#1A3673] rounded-b-[40px] mb-6">
          <TouchableOpacity
            disabled={!isEditing}
            onPress={() => setShowImagePickerModal(true)}
            className="relative mt-2"
          >
            <Image
              source={{ uri: displayImageUri }}
              className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-gray-200"
            />
            {isEditing && (
              <View className="absolute bottom-0 right-0 bg-[#2E4A8A] p-2 rounded-full border-2 border-white">
                <Camera size={14} color="white" />
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold mt-3">
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-white/70 text-sm mt-0.5">
            {user?.profession || 'Alumni Member'}
          </Text>
        </View>

        {!isEditing ? (
          <View className="px-4 pb-10">
            {/* Personal Details Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <Text className="font-bold text-[#1A3673] mb-2 uppercase text-xs tracking-wider">
                Personal Details
              </Text>
              <InfoRow
                label="Full Name"
                value={`${user?.first_name} ${user?.middle_name || ''} ${user?.last_name}`}
                icon={User}
              />
              <InfoRow label="Email Address" value={user?.email} icon={Mail} />
              <InfoRow label="Mobile Number" value={user?.mobile} icon={User} />
              <InfoRow label="Gender" value={user?.gender} icon={User} />
              <InfoRow
                label="Birth Date"
                value={user?.birth_date}
                icon={Calendar}
              />
            </View>

            {/* Samiti Details Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <Text className="font-bold text-[#1A3673] mb-2 uppercase text-xs tracking-wider">
                Samiti Details
              </Text>
              <InfoRow
                label="Hostel Name"
                value={user?.samiti_hostel_name}
                icon={Building}
              />
              <InfoRow
                label="Duration of Stay"
                value={
                  user?.duration_of_stay
                    ? `${user?.duration_of_stay} Years`
                    : null
                }
                icon={Calendar}
              />
              <InfoRow
                label="Batch (From - To)"
                value={
                  user?.from_year && user?.to_year
                    ? `${user.from_year} - ${user.to_year}`
                    : null
                }
                icon={GraduationCap}
              />
            </View>

            {/* Professional Details Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <Text className="font-bold text-[#1A3673] mb-2 uppercase text-xs tracking-wider">
                Professional Details
              </Text>
              <InfoRow
                label="Profession"
                value={user?.profession}
                icon={Briefcase}
              />
              <InfoRow
                label="Designation"
                value={user?.designation}
                icon={Briefcase}
              />
              <InfoRow label="Company" value={user?.company_name} icon={Home} />
            </View>

            {/* Address Details Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <Text className="font-bold text-[#1A3673] mb-2 uppercase text-xs tracking-wider">
                Address
              </Text>
              <InfoRow
                label="Home Address"
                value={getFullAddress()}
                icon={MapPin}
              />
            </View>
          </View>
        ) : (
          <View className="px-4 pb-10">
            {/* Edit Fields */}
            <Text className="font-bold text-[#1A3673] mb-2 uppercase text-xs tracking-wider ml-1">
              Personal Info
            </Text>
            <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm">
              <InputField
                label="First Name"
                value={formData.first_name}
                onChangeText={t => handleUpdateField('first_name', t)}
              />
              <InputField
                label="Middle Name"
                value={formData.middle_name}
                onChangeText={t => handleUpdateField('middle_name', t)}
              />
              <InputField
                label="Last Name"
                value={formData.last_name}
                onChangeText={t => handleUpdateField('last_name', t)}
              />
              <InputField
                label="Email"
                value={formData.email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={t => handleUpdateField('email', t)}
              />
              <View className="mb-3">
                <Text className="text-xs text-gray-500 mb-1">Birth Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex-row justify-between items-center"
                >
                  <Text
                    className={
                      formData.birth_date ? 'text-[#1C1C1C]' : 'text-gray-400'
                    }
                  >
                    {formData.birth_date || 'Select date'}
                  </Text>
                  <Calendar size={18} color="#9CA3AF" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={pickerDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>
              <InputField
                label="Gender"
                value={formData.gender}
                onChangeText={t => handleUpdateField('gender', t)}
              />
            </View>

            {/* ... Rest of Edit Fields ... */}
            <Text className="font-bold text-[#1A3673] mb-2 uppercase text-xs tracking-wider ml-1">
              Samiti Details
            </Text>
            <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm">
              <InputField
                label="Hostel Name"
                value={formData.samiti_hostel_name}
                onChangeText={t => handleUpdateField('samiti_hostel_name', t)}
              />
              <InputField
                label="Duration of Stay (Years)"
                value={formData.duration_of_stay}
                keyboardType="numeric"
                onChangeText={t =>
                  handleUpdateField(
                    'duration_of_stay',
                    t.replace(/[^0-9]/g, ''),
                  )
                }
              />
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <InputField
                    label="From Year"
                    maxLength={4}
                    value={formData.from_year}
                    keyboardType="numeric"
                    onChangeText={t =>
                      handleUpdateField('from_year', t.replace(/[^0-9]/g, ''))
                    }
                  />
                </View>
                <View className="flex-1">
                  <InputField
                    label="To Year"
                    maxLength={4}
                    value={formData.to_year}
                    keyboardType="numeric"
                    onChangeText={t =>
                      handleUpdateField('to_year', t.replace(/[^0-9]/g, ''))
                    }
                  />
                </View>
              </View>
            </View>

            <Text className="font-bold text-[#1A3673] mb-2 uppercase text-xs tracking-wider ml-1">
              Professional Info
            </Text>
            <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm">
              <InputField
                label="Profession"
                value={formData.profession}
                onChangeText={t => handleUpdateField('profession', t)}
              />
              <InputField
                label="Designation"
                value={formData.designation}
                onChangeText={t => handleUpdateField('designation', t)}
              />
              <InputField
                label="Company Name"
                value={formData.company_name}
                onChangeText={t => handleUpdateField('company_name', t)}
              />
            </View>

            <Text className="font-bold text-[#1A3673] mb-2 uppercase text-xs tracking-wider ml-1">
              Address
            </Text>
            <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <InputField
                    label="House No"
                    value={addressData.house_no}
                    onChangeText={t => handleUpdateAddress('house_no', t)}
                  />
                </View>
                <View className="flex-1">
                  <InputField
                    label="Building Name"
                    value={addressData.building_name}
                    onChangeText={t => handleUpdateAddress('building_name', t)}
                  />
                </View>
              </View>
              <InputField
                label="Area / Street"
                value={addressData.area_street}
                onChangeText={t => handleUpdateAddress('area_street', t)}
              />
              <InputField
                label="Landmark"
                value={addressData.landmark}
                onChangeText={t => handleUpdateAddress('landmark', t)}
              />
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <InputField
                    label="City"
                    value={addressData.city}
                    onChangeText={t => handleUpdateAddress('city', t)}
                  />
                </View>
                <View className="flex-1">
                  <InputField
                    label="District"
                    value={addressData.district}
                    onChangeText={t => handleUpdateAddress('district', t)}
                  />
                </View>
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <InputField
                    label="State"
                    value={addressData.state}
                    onChangeText={t => handleUpdateAddress('state', t)}
                  />
                </View>
                <View className="flex-1">
                  <InputField
                    label="Pincode"
                    maxLength={6}
                    value={addressData.pincode}
                    keyboardType="numeric"
                    onChangeText={t =>
                      handleUpdateAddress('pincode', t.replace(/[^0-9]/g, ''))
                    }
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-[#1A3673] py-4 rounded-2xl items-center shadow-md mb-80"
            >
              <Text className="text-white font-bold text-lg">Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* --- IMAGE PICKER MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImagePickerModal}
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowImagePickerModal(false)}
          />
          <View className="bg-white rounded-t-3xl p-6 pb-10 shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-[#1C1C1C]">
                Upload Photo
              </Text>
              <TouchableOpacity onPress={() => setShowImagePickerModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleCameraLaunch}
              className="flex-row items-center gap-4 p-4 mb-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <Camera size={24} color="#2E4A8A" />
              </View>
              <View>
                <Text className="text-[#1C1C1C] font-semibold text-base">
                  Take Photo
                </Text>
                <Text className="text-gray-500 text-xs">
                  Use your camera to snap a picture
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGalleryLaunch}
              className="flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                <ImageIcon size={24} color="#16A34A" />
              </View>
              <View>
                <Text className="text-[#1C1C1C] font-semibold text-base">
                  Choose from Gallery
                </Text>
                <Text className="text-gray-500 text-xs">
                  Select an existing photo from your device
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
