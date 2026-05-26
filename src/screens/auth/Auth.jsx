import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLoginSuccess, submitProfile } from '../../store/authSlice';

// Components
import LoginScreen from './LoginScreen';
import OTPVerification from './OTPVerification';
import ProfileOnboarding from '../onboarding/ProfileOnboarding';
import PendingApproval from '../approval/PendingApproval';

export default function Auth() {
  const dispatch = useDispatch();

  const [currentStep, setCurrentStep] = useState('login');
  const [mobileNumber, setMobileNumber] = useState('');

  const handleSendOTP = mobile => {
    setMobileNumber(mobile);
    setCurrentStep('otp');
  };

  const handleVerifyOTP = async otp => {
    if (otp === '123456') {
      const mockToken = 'demo-token-123';
      await AsyncStorage.setItem('authToken', mockToken);

      const isNewUser = true;

      if (isNewUser) {
        setCurrentStep('onboarding');
      } else {
        dispatch(setLoginSuccess(mockToken));
      }
    } else {
      alert('Invalid OTP');
    }
  };

  const handleEmailLogin = async (email, password) => {
    const mockToken = 'demo-token-123';
    await AsyncStorage.setItem('authToken', mockToken);

    dispatch(setLoginSuccess(mockToken));
  };

  const handleRegister = () => {
    setCurrentStep('onboarding');
  };

  const handleOnboardingComplete = () => {
    dispatch(submitProfile());
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setMobileNumber('');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    setCurrentStep('login');
  };

  if (currentStep === 'otp') {
    return (
      <OTPVerification
        mobile={mobileNumber}
        onVerify={handleVerifyOTP}
        onBack={handleBackToLogin}
      />
    );
  }

  if (currentStep === 'onboarding') {
    return (
      <ProfileOnboarding
        onBack={handleBackToLogin}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (currentStep === 'pending') {
    return <PendingApproval onLogout={handleLogout} />;
  }

  return (
    <LoginScreen
      onSendOTP={handleSendOTP}
      onEmailLogin={handleEmailLogin}
      onRegister={handleRegister}
    />
  );
}
