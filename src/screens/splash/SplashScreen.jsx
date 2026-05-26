import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-10 ">
        <View className="flex-1 items-center justify-center">
          <Image
            source={require('../../assets/images/vsslogo.jpg')}
            resizeMode="contain"
            style={{ width: 200, height: 200 }}
          />
        </View>

        <View className="flex justify-center items-center mb-10 ">
          <Text className="text-center text-black font-semibold opacity-70 ">
            ज्ञानाकडून विकासाकडे
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
