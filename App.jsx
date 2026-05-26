import React from 'react';
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import store from './src/store/store';
import RootStack from './src/navigation/RootStack';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';

const AppProviders = ({ children }) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <View style={styles.container}>{children}</View>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    marginBottom: 45,
  },
});

export default function App() {
  return (
    <AppProviders>
      <NavigationContainer>
        <RootStack />
        <Toast />
      </NavigationContainer>
    </AppProviders>
  );
}
