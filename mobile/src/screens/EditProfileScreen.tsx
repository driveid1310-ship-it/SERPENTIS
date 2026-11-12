import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View, Image, Pressable, ActivityIndicator } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import AppButton from '../components/Button/AppButton';
import AppCard from '../components/Card/AppCard';
import Header from '../components/Header/Header';
import AppInput from '../components/Input/AppInput';
import Screen from '../components/Screen/Screen';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { updateCurrentUser, UserServiceError } from '../services/userService';
import { launchImageLibrary, launchCamera, type Asset } from 'react-native-image-picker';
import { uploadReportImage, ReportImageUploadError } from '../services/reportService';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

interface EditProfileScreenProps {
  navigation: EditProfileScreenNavigationProp;
}

export default function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.profilePicture ?? null);
  const [localPhotoAsset, setLocalPhotoAsset] = useState<Asset | null>(null);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  const initial = user?.fullName?.charAt(0).toUpperCase() || 'C';

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleChangePhoto = useCallback(() => {
    Alert.alert('Profile Photo', 'Choose an action', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const res = await launchCamera({ mediaType: 'photo', quality: 0.8 });
          if (res.assets && res.assets.length > 0) {
            setLocalPhotoAsset(res.assets[0]);
            setProfilePicture(res.assets[0].uri || null);
            setImageError(false);
          }
        }
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
          if (res.assets && res.assets.length > 0) {
            setLocalPhotoAsset(res.assets[0]);
            setProfilePicture(res.assets[0].uri || null);
            setImageError(false);
          }
        }
      },
      {
        text: 'Remove Photo',
        style: 'destructive',
        onPress: () => {
          setLocalPhotoAsset(null);
          setProfilePicture(null);
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  }, []);

  const handleSavePress = useCallback(async () => {
    const normalizedFullName = fullName.trim();

    if (normalizedFullName.length < 2 || normalizedFullName.length > 100) {
      setErrorMessage('Enter a name between 2 and 100 characters.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    let finalPhotoUrl = profilePicture;

    try {
      if (localPhotoAsset) {
        setIsUploadingImage(true);
        finalPhotoUrl = await uploadReportImage(localPhotoAsset);
        setIsUploadingImage(false);
      }

      await updateCurrentUser({ 
        fullName: normalizedFullName, 
        profilePicture: finalPhotoUrl || '' // Send empty string if removed
      });
      await refreshUser();
      Alert.alert('Profile updated', 'Your profile has been updated.', [
        { text: 'Done', onPress: handleBackPress },
      ]);
    } catch (error) {
      setIsUploadingImage(false);
      setErrorMessage(
        error instanceof UserServiceError || error instanceof ReportImageUploadError
          ? error.message
          : 'Unable to update your profile. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [fullName, profilePicture, localPhotoAsset, handleBackPress, refreshUser]);

  return (
    <Screen scrollable keyboardAvoiding>
      <Header
        title="Edit Profile"
        subtitle="Update your profile information."
        onBackPress={handleBackPress}
      />

      <View style={styles.section}>
        <AppCard elevation="sm" style={styles.photoCard}>
          <Pressable onPress={handleChangePhoto} style={styles.avatarCircle}>
            {profilePicture && !imageError ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.avatarImage}
                onError={() => setImageError(true)}
              />
            ) : (
              <Text style={styles.avatarInitial}>{initial}</Text>
            )}
            {isUploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={theme.colors.text} />
              </View>
            )}
          </Pressable>
          <AppButton 
            variant="outline" 
            label="Change Photo" 
            onPress={handleChangePhoto} 
            disabled={isSaving}
          />
        </AppCard>
      </View>

      <View style={styles.section}>
        <AppCard elevation="sm">
          <AppInput
            label="Full Name"
            value={fullName}
            onChangeText={(value: string) => {
              setFullName(value);
              setErrorMessage(null);
            }}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={100}
            editable={!isSaving}
            errorMessage={errorMessage ?? undefined}
            returnKeyType="done"
          />
          <Text style={styles.helperText}>
            Your email and account details cannot be changed here.
          </Text>
        </AppCard>
      </View>

      <View style={styles.actions}>
        <AppButton
          label={isUploadingImage ? 'Uploading Photo...' : 'Save Changes'}
          onPress={handleSavePress}
          loading={isSaving}
          disabled={isSaving}
        />
        <AppButton
          label="Cancel"
          onPress={handleBackPress}
          variant="outline"
          disabled={isSaving}
          style={styles.cancelButton}
        />
      </View>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  section: {
    marginTop: theme.spacing.xl,
  },
  photoCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontSize: theme.typography.h2,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },
  uploadingOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.xs,
    lineHeight: 18,
  },
  actions: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  cancelButton: {
    marginBottom: theme.spacing.xl,
  },
});