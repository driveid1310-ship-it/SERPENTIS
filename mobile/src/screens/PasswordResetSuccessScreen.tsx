import React, { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import ResultView from '../components/Result/ResultView';

type PasswordResetSuccessScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PasswordResetSuccess'
>;

export default function PasswordResetSuccessScreen({
  navigation,
}: PasswordResetSuccessScreenProps) {
  const handleBackToLoginPress = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);

  return (
    <ResultView
      status="success"
      title="PASSWORD UPDATED"
      description="Your password has been successfully updated."
      primaryAction={{
        label: 'DONE',
        onPress: handleBackToLoginPress,
      }}
    />
  );
}
