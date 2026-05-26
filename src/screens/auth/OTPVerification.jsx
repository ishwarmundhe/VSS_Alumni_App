import { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- Added import
import Toast from 'react-native-toast-message';

// Import your API hooks and Redux actions
import { useVerifyOtpMutation, useSendOtpMutation } from '../../api/apiSlice';
import { setLoginSuccess } from '../../store/authSlice';

export default function OTPVerification({ mobile, onBack }) {
  const dispatch = useDispatch();
  const otpRef = useRef(null);

  // RTK Query Hooks
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();

  // Local State
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpTheme = useMemo(
    () => ({
      containerStyle: {
        marginBottom: 16,
      },
      pinCodeContainerStyle: {
        borderRadius: 16,
        borderWidth: 2,
        backgroundColor: '#F3F4F6',
        borderColor: '#D1D5DB',
        width: 48,
        height: 56,
      },
      pinCodeTextStyle: {
        color: '#1F2937',
        fontSize: 20,
        fontWeight: '600',
      },
      focusStickStyle: {
        backgroundColor: '#2E4A8A',
      },
      focusedPinCodeContainerStyle: {
        borderColor: '#2E4A8A',
        backgroundColor: '#F0FDF4',
      },
    }),
    [],
  );

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleResendOTP = async () => {
    setOtp('');
    otpRef.current?.clear();
    try {
      const response = await sendOtp({ country_code: '+91', mobile }).unwrap();
      console.log(response);
      setTimer(30);
      setCanResend(false);
      setOtp('');
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'A new OTP has been sent to your mobile.',
      });
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to resend OTP. Please try again.',
      });
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    try {
      const result = await verifyOtp({
        country_code: '+91',
        mobile: mobile,
        otp: otp,
      }).unwrap();

      console.log('OTP Verification Result:', result);

      // 1. Dispatch the FULL result object to Redux (triggers routing logic)
      dispatch(setLoginSuccess(result));

      // 2. Determine boolean states based on the response to save to AsyncStorage
      const userRoles = result.roles || [];
      const isComplete =
        userRoles.includes('ADMIN') ||
        userRoles.includes('ALUMNI') ||
        result.code === 'PENDING_VERIFICATION';
      const isApprvd =
        userRoles.includes('ADMIN') || userRoles.includes('ALUMNI');

      // 3. Save as a JSON string so RootStack can read it on reload
      const authData = {
        token: result.access_token,
        role: userRoles.includes('ADMIN') ? 'ADMIN' : 'ALUMNI',
        isProfileComplete: isComplete,
        isApproved: isApprvd,
      };

      await AsyncStorage.setItem('authData', JSON.stringify(authData));
    } catch (error) {
      console.error('Verification failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: 'The OTP you entered is invalid or has expired.',
      });
    }
  };

  const isOtpComplete = otp.length === 6;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Logo */}
        <View className="items-center mb-8">
          <Image
            source={require('../../assets/images/vsslogo.jpg')}
            resizeMode="contain"
            style={{ width: 96, height: 96 }}
          />
        </View>

        {/* Header */}
        <View className="mb-8">
          <Text className="text-center text-xl text-[#2E4A8A] font-semibold mb-3">
            Verify OTP
          </Text>
          <Text className="text-center text-[#1C1C1C] opacity-70 px-4">
            We've sent a 6-digit OTP to
          </Text>
          <Text className="text-center text-[#1C1C1C] mt-2 font-medium">
            +91 {mobile}
          </Text>
          <TouchableOpacity
            onPress={onBack}
            disabled={isVerifying}
            className="mt-2"
          >
            <Text
              className={`text-sm text-center ${isVerifying ? 'text-gray-400' : 'text-[#2E4A8A]'}`}
            >
              Change Number
            </Text>
          </TouchableOpacity>
        </View>

        {/* OTP Input */}
        <View className="mb-6">
          <OtpInput
            ref={otpRef}
            numberOfDigits={6}
            focusColor="#2E4A8A"
            focusStickBlinkingDuration={500}
            onTextChange={setOtp}
            onFilled={setOtp}
            textInputProps={{
              accessibilityLabel: 'One-Time Password',
              autoFocus: true,
              keyboardType: 'number-pad',
              editable: !isVerifying,
            }}
            theme={otpTheme}
          />
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={!isOtpComplete || isVerifying}
          className={`rounded-lg py-3 mb-6 flex-row justify-center items-center ${
            isOtpComplete && !isVerifying ? 'bg-[#2E4A8A]' : 'bg-gray-300'
          }`}
        >
          {isVerifying ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-center font-semibold">
              Verify & Continue
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View className="items-center mb-6">
          {!canResend ? (
            <Text className="text-sm text-[#717182]">
              Resend OTP in <Text className="text-[#2E4A8A]">{timer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator size="small" color="#2E4A8A" />
              ) : (
                <Text className="text-sm text-[#2E4A8A]">Resend OTP</Text>
              )}
            </TouchableOpacity>
          )}
        </View>


      </View>
    </SafeAreaView>
  );
}
