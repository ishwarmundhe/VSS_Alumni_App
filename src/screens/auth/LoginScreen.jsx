import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useSendOtpMutation,
  useLoginWithPasswordMutation,
} from '../../api/apiSlice';
import { useDispatch } from 'react-redux';
import { setLoginSuccess } from '../../store/authSlice';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ onSendOTP, onRegister }) {
  const [mobile, setMobile] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // <-- Added state for Password Visibility Toggle -->
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [loginWithPassword, { isLoading: isLoggingIn }] =
    useLoginWithPasswordMutation();

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardDidShowListener = Keyboard.addListener(
      keyboardShowEvent,
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      keyboardHideEvent,
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSendOTP = async () => {
    if (mobile.length !== 10) return;
    Keyboard.dismiss();

    try {
      const res = await sendOtp({
        country_code: '+91',
        mobile: mobile,
      }).unwrap();

      console.log('OTP sent successfully:', res);

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
    if (!adminUsername.trim() || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter a valid identifier and password.',
      });
      return;
    }

    Keyboard.dismiss();

    try {
      const result = await loginWithPassword({
        username: adminUsername.trim(),
        password,
      }).unwrap();

      dispatch(setLoginSuccess(result));

      const userRoles = result.roles || [];
      const isComplete =
        userRoles.includes('ADMIN') ||
        userRoles.includes('ALUMNI') ||
        result.code === 'PENDING_VERIFICATION';
      const isApproved =
        userRoles.includes('ADMIN') || userRoles.includes('ALUMNI');

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
          keyboardShouldPersistTaps="handled"
        >
          {!isKeyboardVisible && (
            <>
              <View className="items-center mb-8">
                <Image
                  source={require('../../assets/images/vsslogo.jpg')}
                  resizeMode="contain"
                  style={{ width: 128, height: 128 }}
                />
              </View>

              <View className="mb-8">
                <Text className="text-center text-xl text-[#1C1C1C] mb-1">
                  माजी विद्यार्थी मंडळ
                </Text>
                <Text className="text-center text-lg text-[#2E4A8A] font-semibold mb-2">
                  VSS Alumni Connect
                </Text>
                <Text className="text-center text-[#1C1C1C] opacity-70 px-4">
                  आमची समिती आपल्या आयुष्यभर साथ देते. पुन्हा जुडा, वाढा, आणि
                  पुढे आणा.
                </Text>
                <Text className="text-center text-sm text-[#1C1C1C] opacity-60 px-4 mt-2">
                  Our Samiti is a lifelong support system. Reconnect, grow, and
                  give forward.
                </Text>
              </View>
            </>
          )}

          {!showEmailLogin ? (
            <View className={`gap-6 flex-1 ${isKeyboardVisible ? 'mt-4' : ''}`}>
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
                  disabled={mobile.length !== 10 || isSendingOtp}
                  className={`rounded-lg py-3 ${mobile.length === 10 ? 'bg-[#2E4A8A]' : 'bg-gray-300'}`}
                >
                  <Text className="text-white text-center font-semibold">
                    {isSendingOtp ? 'Sending...' : 'Send OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-3 text-xs text-gray-500 uppercase">Or</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <TouchableOpacity
                onPress={() => setShowEmailLogin(true)}
                className="border border-[#2E4A8A] rounded-lg py-3"
              >
                <Text className="text-[#2E4A8A] text-center font-medium">
                  Login as Administrator
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className={`gap-6 flex-1 ${isKeyboardVisible ? 'mt-4' : ''}`}>
              <View className="gap-4">
                <View className="gap-2">
                  <Text className="text-[#1C1C1C] font-medium">
                    Username, Email or Mobile *
                  </Text>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    placeholder="Enter username, email or mobile"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={adminUsername}
                    onChangeText={setAdminUsername}
                    className="bg-[#F2F4F7] rounded-lg px-4 py-3 text-[#1C1C1C]"
                  />
                </View>

                {/* <-- Updated Password Field --> */}
                <View className="gap-2">
                  <Text className="text-[#1C1C1C] font-medium">Password *</Text>
                  <View className="relative justify-center">
                    <TextInput
                      placeholderTextColor="#9CA3AF"
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      // Added pr-16 to make room for the toggle button so text doesn't hide behind it
                      className="bg-[#F2F4F7] rounded-lg pl-4 pr-16 py-3 text-[#1C1C1C] w-full"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 h-full justify-center"
                    >
                      <Text className="text-[#2E4A8A] font-medium text-sm">
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleAdminLogin}
                  disabled={
                    adminUsername.trim().length === 0 ||
                    password.length === 0 ||
                    isLoggingIn
                  }
                  className={`rounded-lg py-3 ${
                    adminUsername.trim().length > 0 && password.length > 0
                      ? 'bg-[#2E4A8A]'
                      : 'bg-gray-300'
                  }`}
                >
                  <Text className="text-white text-center font-semibold">
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setShowEmailLogin(false);
                  Keyboard.dismiss();
                }}
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
