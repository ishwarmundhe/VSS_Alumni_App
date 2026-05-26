import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure to import this!
import {
  useSendOtpMutation,
  useLoginWithPasswordMutation,
} from '../../api/apiSlice';
import { useDispatch } from 'react-redux';
import { setLoginSuccess } from '../../store/authSlice';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ onSendOTP, onRegister }) {
  const [mobile, setMobile] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const dispatch = useDispatch();

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [loginWithPassword, { isLoading: isLoggingIn }] =
    useLoginWithPasswordMutation();

  const handleSendOTP = async () => {
    if (mobile.length !== 10) return;
    console.log('==>');

    try {
      const res = await sendOtp({
        country_code: '+91',
        mobile: mobile,
      }).unwrap();
      console.log('res', res);

      if (onSendOTP) {
        onSendOTP(mobile);
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send OTP. Please check your number.',
      });
    }
  };

  const handleAdminLogin = async () => {
    if (adminMobile.length < 10 || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter a valid mobile number and password.',
      });
      return;
    }

    try {
      const result = await loginWithPassword({
        username: adminMobile,
        password,
      }).unwrap();

      console.log('Login Response: ', result);

      // 1. Dispatch the FULL result object to Redux
      dispatch(setLoginSuccess(result));

      // 2. Determine boolean states based on the response to save to AsyncStorage
      const userRoles = result.roles || [];
      const isComplete =
        userRoles.includes('ADMIN') ||
        userRoles.includes('ALUMNI') ||
        result.code === 'PENDING_VERIFICATION';
      const isApproved =
        userRoles.includes('ADMIN') || userRoles.includes('ALUMNI');

      // 3. Save as a JSON string so RootStack can read it on reload
      const authData = {
        token: result.access_token,
        role: userRoles.includes('ADMIN') ? 'ADMIN' : 'ALUMNI',
        isProfileComplete: isComplete,
        isApproved: isApproved,
      };
      await AsyncStorage.setItem('authData', JSON.stringify(authData));
    } catch (error) {
      console.error('Login failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Invalid credentials. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 py-8"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className="items-center mb-8">
            <Image
              source={require('../../assets/images/vsslogo.jpg')}
              resizeMode="contain"
              style={{ width: 128, height: 128 }}
            />
          </View>

          {/* Text content */}
          <View className="mb-8">
            <Text className="text-center text-xl text-[#1C1C1C] mb-1">
              माजी विद्यार्थी मंडळ
            </Text>
            <Text className="text-center text-lg text-[#2E4A8A] font-semibold mb-2">
              VSS Alumni Connect
            </Text>
            <Text className="text-center text-[#1C1C1C] opacity-70 px-4">
              आमची समिती आपल्या आयुष्यभर साथ देते. पुन्हा जुडा, वाढा, आणि पुढे
              आणा.
            </Text>
            <Text className="text-center text-sm text-[#1C1C1C] opacity-60 px-4 mt-2">
              Our Samiti is a lifelong support system. Reconnect, grow, and give
              forward.
            </Text>
          </View>

          {!showEmailLogin ? (
            <View className="gap-6 flex-1">
              {/* Mobile Login - Primary */}
              <View className="gap-4">
                <View className="gap-2">
                  <Text className="text-[#1C1C1C] font-medium">
                    Mobile Number *
                  </Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    placeholder="Enter 10 digit mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={mobile}
                    onChangeText={text => setMobile(text.replace(/\D/g, ''))}
                    className="bg-[#F2F4F7] rounded-lg px-4 py-3 text-[#1C1C1C]"
                  />
                  <Text className="text-xs text-[#717182]">
                    We'll send you an OTP to verify your number
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleSendOTP}
                  disabled={mobile.length !== 10}
                  className={`rounded-lg py-3 ${mobile.length === 10 ? 'bg-[#2E4A8A]' : 'bg-gray-300'}`}
                >
                  <Text className="text-white text-center font-semibold">
                    Send OTP
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-3 text-xs text-gray-500 uppercase">Or</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Email Login Button */}
              <TouchableOpacity
                onPress={() => setShowEmailLogin(true)}
                className="border border-[#2E4A8A] rounded-lg py-3"
              >
                <Text className="text-[#2E4A8A] text-center font-medium">
                  Login as Administrator
                </Text>
              </TouchableOpacity>

              {/* Register */}
              {/* <View className="mt-auto pt-6 pb-4">
                <Text className="text-center text-sm text-[#717182] mb-3">
                  Not registered yet?
                </Text>
                <TouchableOpacity
                  onPress={onRegister}
                  className="border border-[#1F8F3A] rounded-lg py-3"
                >
                  <Text className="text-[#1F8F3A] text-center font-medium">
                    Register as New Alumni
                  </Text>
                </TouchableOpacity>
              </View> */}
            </View>
          ) : (
            <View className="gap-6 flex-1">
              {/* Admin Login Form */}
              <View className="gap-4">
                <View className="gap-2">
                  <Text className="text-[#1C1C1C] font-medium">
                    Mobile Number *
                  </Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    placeholder="Enter registered mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={adminMobile}
                    onChangeText={text =>
                      setAdminMobile(text.replace(/\D/g, ''))
                    }
                    className="bg-[#F2F4F7] rounded-lg px-4 py-3 text-[#1C1C1C]"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-[#1C1C1C] font-medium">Password *</Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    placeholder="Enter your password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    className="bg-[#F2F4F7] rounded-lg px-4 py-3 text-[#1C1C1C]"
                  />
                </View>

                {/* Login Button: Disabled until both fields are filled */}
                <TouchableOpacity
                  onPress={handleAdminLogin}
                  disabled={adminMobile.length !== 10 || password.length === 0}
                  className={`rounded-lg py-3 ${
                    adminMobile.length === 10 && password.length > 0
                      ? 'bg-[#2E4A8A]'
                      : 'bg-gray-300'
                  }`}
                >
                  <Text className="text-white text-center font-semibold">
                    Login
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => setShowEmailLogin(false)}
                className="py-3 mt-auto"
              >
                <Text className="text-center text-[#2E4A8A]">
                  ← Back to OTP Login
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
