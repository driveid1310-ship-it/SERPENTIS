import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import AppProvider from './src/providers/AppProvider';
import { ENV_CONFIG_ERROR } from './src/config/env';

export default function App() {
  if (ENV_CONFIG_ERROR) {
    return (
      <SafeAreaProvider>
        <View style={styles.configErrorContainer}>
          <Text style={styles.configErrorTitle}>SERPENTIS Configuration Required</Text>
          <Text style={styles.configErrorMessage}>{ENV_CONFIG_ERROR}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  configErrorContainer: {
    flex: 1,
    backgroundColor: '#0A0D14',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  configErrorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F87171',
    marginBottom: 12,
    textAlign: 'center',
  },
  configErrorMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#E5E7EB',
    textAlign: 'center',
  },
});