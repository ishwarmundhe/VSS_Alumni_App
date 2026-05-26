import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';

const CommonHeader = ({ title, onBackPress, onRightPress, RightIcon }) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#4a7c59', '#557A62']}
      style={{ paddingTop: insets.top }}
      className="p-3"
    >
      <View className="flex-row items-center justify-between">
        {/* Left Side Container */}
        <View className="w-10">
          {onBackPress && (
            <TouchableOpacity onPress={onBackPress} className="p-2 -ml-2">
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Center Title */}
        <View className="flex-1">
          <Text
            className="text-xl font-bold text-white text-center"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right Side Container */}
        <View className="w-10 items-end">
          {RightIcon && (
            <TouchableOpacity onPress={onRightPress} className="p-2 -mr-2">
              <RightIcon size={22} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

export default CommonHeader;
