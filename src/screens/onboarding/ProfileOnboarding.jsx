import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
  Image,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';

// 1. REPLACED old image picker with crop-picker
import ImagePicker from 'react-native-image-crop-picker';

import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  FileText,
  Camera,
  Calendar,
  Image as ImageIcon,
  X,
  AlertTriangle,
  Trash2, // 2. IMPORTED Trash2 for the remove button
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRegisterUserMutation, apiSlice } from '../../api/apiSlice';
import { submitProfile, setLogout } from '../../store/authSlice';

export default function ProfileOnboarding() {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [registerUser, { isLoading: isSubmitting }] = useRegisterUserMutation();

  const [formData, setFormData] = useState({
    profileImage: null,
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: 'MALE',
    email: '',
    birth_date: '',
    house_no: '',
    building_name: '',
    area_street: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    samiti_hostel_name: '',
    duration_of_stay: '',
    from_year: '',
    to_year: '',
    profession: '',
    designation: '',
    company_name: '',
  });

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      setShowDatePicker(false);
      setPickerDate(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      updateField('birth_date', `${year}-${month}-${day}`);
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  // 3. UPDATED to use ImagePicker.openCamera with cropping
  const handleCameraLaunch = async () => {
    setShowImagePickerModal(false);
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      try {
        const image = await ImagePicker.openCamera({
          width: 400,
          height: 400,
          cropping: true,
          cropperCircleOverlay: true, // Perfect for profile pictures
          mediaType: 'photo',
        });
        updateField('profileImage', image.path); // Note: it uses .path instead of .uri
      } catch (error) {
        if (error.code !== 'E_PICKER_CANCELLED') {
          console.log('Camera Error: ', error);
        }
      }
    }
  };

  // 4. UPDATED to use ImagePicker.openPicker with cropping
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
      updateField('profileImage', image.path);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Gallery Error: ', error);
      }
    }
  };

  // 5. NEW function to clear the photo
  const handleRemovePhoto = () => {
    updateField('profileImage', null);
    setShowImagePickerModal(false);
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else setShowSubmitModal(true);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCancelRegistration = () => {
    setShowCancelModal(true);
  };

  const confirmCancelRegistration = async () => {
    setShowCancelModal(false);
    await AsyncStorage.removeItem('authData');
    dispatch(apiSlice.util.resetApiState());
    dispatch(setLogout());
  };

  const handleConfirmSubmit = async () => {
    const userData = {
      first_name: formData.first_name,
      middle_name: formData.middle_name,
      last_name: formData.last_name,
      gender: formData.gender,
      email: formData.email,
      birth_date: formData.birth_date,
      samiti_hostel_name: formData.samiti_hostel_name,
      duration_of_stay: formData.duration_of_stay,
      profession: formData.profession,
      designation: formData.designation,
      company_name: formData.company_name,
      from_year: parseInt(formData.from_year, 10) || 0,
      to_year: parseInt(formData.to_year, 10) || 0,
      addresses: [
        {
          house_no: formData.house_no,
          building_name: formData.building_name,
          area_street: formData.area_street,
          landmark: formData.landmark,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India',
          address_type: 'HOME',
        },
      ],
    };

    const payload = new FormData();
    payload.append('data', JSON.stringify(userData));

    if (formData.profileImage) {
      payload.append('profile_image', {
        uri: formData.profileImage, // image.path still works fine passed as uri here
        name: 'profile_photo.jpg',
        type: 'image/jpeg',
      });
    }

    try {
      await registerUser(payload).unwrap();
      setShowSubmitModal(false);
      dispatch(submitProfile());
    } catch (error) {
      console.error('Registration failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'There was an issue saving your profile.',
      });
      setShowSubmitModal(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.first_name.trim() &&
          formData.middle_name.trim() &&
          formData.last_name.trim() &&
          formData.gender &&
          formData.birth_date &&
          formData.email.trim()
        );
      case 2:
        return (
          formData.house_no.trim() &&
          formData.building_name.trim() &&
          formData.area_street.trim() &&
          formData.landmark.trim() &&
          formData.city.trim() &&
          formData.district.trim() &&
          formData.state.trim() &&
          formData.pincode.trim()
        );
      case 3:
        return (
          formData.samiti_hostel_name.trim() &&
          formData.duration_of_stay.trim() &&
          formData.from_year.trim() &&
          formData.to_year.trim()
        );
      case 4:
        return (
          formData.profession.trim() &&
          formData.designation.trim() &&
          formData.company_name.trim()
        );
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center mb-6 gap-2">
      {[1, 2, 3, 4].map(i => (
        <View
          key={i}
          className={`h-2 rounded-full flex-1 ${
            i <= step ? 'bg-[#2E4A8A]' : 'bg-gray-200'
          }`}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-4">
          <View className="flex-row items-center gap-3 mb-4">
            <TouchableOpacity
              onPress={step === 1 ? handleCancelRegistration : handleBack}
              className="p-2 -ml-2 rounded-full bg-gray-50"
            >
              <ArrowLeft size={24} color="#2E4A8A" />
            </TouchableOpacity>
            <View>
              <Text className="text-[#2E4A8A] text-xl font-bold">
                Complete Profile
              </Text>
              <Text className="text-gray-500 text-sm">
                Step {step} of {totalSteps}
              </Text>
            </View>
          </View>

          {renderStepIndicator()}

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 250 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <View className="gap-5">
                <Text className="text-lg font-semibold text-[#1C1C1C]">
                  Personal Details
                </Text>

                <View className="items-center mb-2">
                  <TouchableOpacity
                    onPress={() => setShowImagePickerModal(true)}
                    className="w-28 h-28 bg-gray-50 rounded-full items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden relative"
                  >
                    {formData.profileImage ? (
                      <Image
                        source={{ uri: formData.profileImage }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center">
                        <Camera size={28} color="#9CA3AF" />
                        <Text className="text-[10px] text-gray-400 mt-1">
                          Add Photo
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Rest of Step 1 Inputs... */}
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      First Name *
                    </Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="Rajesh"
                      value={formData.first_name}
                      onChangeText={t => updateField('first_name', t)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      Middle Name *
                    </Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="Kumar"
                      value={formData.middle_name}
                      onChangeText={t => updateField('middle_name', t)}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-xs text-gray-500 mb-1">
                    Last Name *
                  </Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                    placeholder="Patil"
                    value={formData.last_name}
                    onChangeText={t => updateField('last_name', t)}
                  />
                </View>

                <View>
                  <Text className="text-xs text-gray-500 mb-1">Gender *</Text>
                  <View className="flex-row gap-3">
                    {['MALE', 'FEMALE'].map(g => (
                      <TouchableOpacity
                        key={g}
                        onPress={() => updateField('gender', g)}
                        className={`flex-1 p-3 rounded-xl border ${formData.gender === g ? 'bg-blue-50 border-[#2E4A8A]' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <Text
                          className={`text-center ${formData.gender === g ? 'text-[#2E4A8A] font-bold' : 'text-gray-500'}`}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      Date of Birth *
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-row justify-between items-center"
                    >
                      <Text
                        className={
                          formData.birth_date
                            ? 'text-[#1C1C1C]'
                            : 'text-gray-400'
                        }
                      >
                        {formData.birth_date || 'Select Date'}
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
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Email *</Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="user@mail.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.email}
                      onChangeText={t => updateField('email', t)}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* STEP 2: Detailed Address */}
            {step === 2 && (
              <View className="gap-5">
                <Text className="text-lg font-semibold text-[#1C1C1C]">
                  Home Address
                </Text>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      House No *
                    </Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="Flat 402"
                      value={formData.house_no}
                      onChangeText={t => updateField('house_no', t)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      Building Name *
                    </Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="Shivneri Apts"
                      value={formData.building_name}
                      onChangeText={t => updateField('building_name', t)}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-xs text-gray-500 mb-1">
                    Area / Street *
                  </Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                    placeholder="JM Road, Deccan"
                    value={formData.area_street}
                    onChangeText={t => updateField('area_street', t)}
                  />
                </View>

                <View>
                  <Text className="text-xs text-gray-500 mb-1">Landmark *</Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                    placeholder="Near Post Office"
                    value={formData.landmark}
                    onChangeText={t => updateField('landmark', t)}
                  />
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">City *</Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="Pune"
                      value={formData.city}
                      onChangeText={t => updateField('city', t)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      District *
                    </Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="Pune"
                      value={formData.district}
                      onChangeText={t => updateField('district', t)}
                    />
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">State *</Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="Maharashtra"
                      value={formData.state}
                      onChangeText={t => updateField('state', t)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      Pincode *
                    </Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="411004"
                      keyboardType="numeric"
                      value={formData.pincode}
                      onChangeText={t => updateField('pincode', t)}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* STEP 3: Samiti History */}
            {step === 3 && (
              <View className="gap-5">
                <Text className="text-lg font-semibold text-[#1C1C1C]">
                  Samiti History
                </Text>
                <View>
                  <Text className="text-xs text-gray-500 mb-1">
                    Samithi Hostel Name *
                  </Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                    placeholder="e.g. Main Boys Hostel"
                    value={formData.samiti_hostel_name}
                    onChangeText={t => updateField('samiti_hostel_name', t)}
                  />
                </View>
                <View>
                  <Text className="text-xs text-gray-500 mb-1">
                    Duration of Stay *
                  </Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                    placeholder="e.g. 4 Years"
                    value={formData.duration_of_stay}
                    onChangeText={t => updateField('duration_of_stay', t)}
                  />
                </View>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      From (Year) *
                    </Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="2018"
                      keyboardType="numeric"
                      value={formData.from_year}
                      onChangeText={t => updateField('from_year', t)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      To (Year) *
                    </Text>
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                      placeholder="2022"
                      keyboardType="numeric"
                      value={formData.to_year}
                      onChangeText={t => updateField('to_year', t)}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* STEP 4: Professional & Terms */}
            {step === 4 && (
              <View className="gap-5">
                <Text className="text-lg font-semibold text-[#1C1C1C]">
                  Professional Details
                </Text>
                <View>
                  <Text className="text-xs text-gray-500 mb-1">
                    Profession *
                  </Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                    placeholder="e.g. Software Engineer"
                    value={formData.profession}
                    onChangeText={t => updateField('profession', t)}
                  />
                </View>
                <View>
                  <Text className="text-xs text-gray-500 mb-1">
                    Designation *
                  </Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                    placeholder="e.g. Senior Manager"
                    value={formData.designation}
                    onChangeText={t => updateField('designation', t)}
                  />
                </View>
                <View>
                  <Text className="text-xs text-gray-500 mb-1">
                    Company Name *
                  </Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-[#1C1C1C]"
                    placeholder="e.g. Google India"
                    value={formData.company_name}
                    onChangeText={t => updateField('company_name', t)}
                  />
                </View>
                <View className="bg-blue-50 p-4 rounded-xl mt-4 border border-blue-100 flex-row gap-3">
                  <FileText size={20} color="#2E4A8A" className="mt-1" />
                  <View className="flex-1">
                    <Text className="text-[#2E4A8A] font-bold text-sm mb-1">
                      Terms & Conditions
                    </Text>
                    <Text className="text-[#2E4A8A] text-xs leading-5">
                      Alumni is bound by rules and regulations of Vidhyarth
                      Sahyak Samathi. By submitting, you agree to these terms.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View className="h-10" />
          </ScrollView>

          {/* FOOTER BUTTONS */}
          <View className="flex-row gap-4 mt-4 pt-2 border-t border-gray-100">
            <TouchableOpacity
              onPress={step === 1 ? handleCancelRegistration : handleBack}
              className="flex-1 bg-gray-100 p-4 rounded-xl items-center flex-row justify-center gap-2"
            >
              <Text
                className={`font-semibold ${step === 1 ? 'text-red-600' : 'text-[#717182]'}`}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              disabled={!isStepValid()}
              className={`flex-1 p-4 rounded-xl items-center flex-row justify-center gap-2 ${
                isStepValid() ? 'bg-[#2E4A8A]' : 'bg-[#2E4A8A]/40'
              }`}
            >
              <Text className="text-white font-semibold text-base">
                {step === totalSteps ? 'Submit Profile' : 'Next Step'}
              </Text>
              {step === totalSteps ? (
                <CheckCircle size={20} color="white" />
              ) : (
                <ArrowRight size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* --- CANCEL CONFIRMATION MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCancelModal}
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-5">
          <View className="bg-white w-full max-w-sm rounded-3xl p-6 py-8 shadow-2xl items-center border border-gray-100">
            <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-5 border-4 border-white shadow-sm">
              <AlertTriangle size={36} color="#DC2626" strokeWidth={2} />
            </View>
            <Text className="text-2xl font-black text-[#1C1C1C] mb-2 text-center tracking-wide">
              Cancel Profile?
            </Text>
            <Text className="text-[#717182] mb-8 leading-6 text-center px-2">
              Are you sure you want to go back to the login screen? Any details
              you have entered will be lost.
            </Text>
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-[#4B5563] font-bold text-center">
                  Keep Editing
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmCancelRegistration}
                className="flex-1 bg-red-500 py-4 rounded-xl shadow-sm flex-row justify-center items-center"
              >
                <Text className="text-white font-bold text-center">
                  Go to Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- CUSTOM IMAGE PICKER BOTTOM SHEET MODAL --- */}
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

            {/* 6. NEW conditional render for "Remove Photo" option */}
            {formData.profileImage && (
              <TouchableOpacity
                onPress={handleRemovePhoto}
                className="flex-row items-center gap-4 p-4 mt-3 bg-red-50 rounded-xl border border-red-100"
              >
                <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
                  <Trash2 size={24} color="#DC2626" />
                </View>
                <View>
                  <Text className="text-[#DC2626] font-semibold text-base">
                    Remove Photo
                  </Text>
                  <Text className="text-red-400 text-xs">
                    Clear current profile picture
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* --- SUBMIT CONFIRMATION MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSubmitModal}
        onRequestClose={() => !isSubmitting && setShowSubmitModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-5">
          <View className="bg-white w-full max-w-sm rounded-3xl p-6 py-8 shadow-2xl items-center border border-gray-100">
            <View className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-5 border-4 border-white shadow-sm">
              <CheckCircle size={36} color="#1F8F3A" strokeWidth={2} />
            </View>
            <Text className="text-2xl font-black text-[#1C1C1C] mb-2 text-center tracking-wide">
              Ready to Submit?
            </Text>
            <Text className="text-[#717182] mb-8 leading-6 text-center px-2">
              We will send your details to the Samiti Admin for verification.
              Once approved, you will get full access to the network.
            </Text>
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-[#4B5563] font-bold text-center">
                  Review
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-[#1F8F3A] py-4 rounded-xl shadow-sm flex-row justify-center items-center"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-center">
                    Confirm
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
