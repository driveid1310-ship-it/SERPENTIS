import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import { theme } from '../theme';

type SosScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SOS'
>;

interface SosScreenProps {
  navigation: SosScreenNavigationProp;
}

interface EmergencyService {
  key: string;
  label: string;
  description: string;
  phoneNumber: string;
}

// Standard public emergency numbers (India). These are real, published
// numbers — tapping a card genuinely opens the device dialer via the
// core Linking API. Nothing here is fabricated.
const EMERGENCY_SERVICES: EmergencyService[] = [
  {
    key: 'national-emergency',
    label: 'National Emergency',
    description: 'All-in-one emergency number',
    phoneNumber: '112',
  },
  {
    key: 'police',
    label: 'Police',
    description: 'Report a crime or safety threat',
    phoneNumber: '100',
  },
  {
    key: 'fire',
    label: 'Fire Service',
    description: 'Fire or rescue emergency',
    phoneNumber: '101',
  },
  {
    key: 'ambulance',
    label: 'Ambulance',
    description: 'Medical emergency',
    phoneNumber: '102',
  },
  {
    key: 'women-helpline',
    label: "Women's Helpline",
    description: '24x7 support and safety assistance',
    phoneNumber: '1091',
  },
  {
    key: 'child-helpline',
    label: 'Child Helpline',
    description: 'Report child abuse or a child in distress',
    phoneNumber: '1098',
  },
];

export default function SosScreen({ navigation }: SosScreenProps) {
  const [alertNoticeVisible, setAlertNoticeVisible] = useState(false);
  const [locationNoticeVisible, setLocationNoticeVisible] = useState(false);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCallPress = useCallback((service: EmergencyService) => {
    Alert.alert(
      `Call ${service.label}?`,
      `This will dial ${service.phoneNumber} using your phone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`tel:${service.phoneNumber}`).catch(() => {
              Alert.alert(
                'Unable to place call',
                'Your device could not open the dialer.',
              );
            });
          },
        },
      ],
    );
  }, []);

  const handleUseCurrentLocationPress = useCallback(() => {
    setLocationNoticeVisible(true);
  }, []);

  const handleSendSosAlertPress = useCallback(() => {
    setAlertNoticeVisible(true);
  }, []);

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="SOS"
        subtitle="Reach emergency services quickly."
        onBackPress={handleBackPress}
      />

      <View style={styles.section}>
        <AppCard elevation="md" style={styles.introCard}>
          <Text style={styles.introTitle}>In immediate danger?</Text>
          <Text style={styles.introMessage}>
            Tap a service below to call for help right away.
          </Text>
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Call</Text>
        <View style={styles.servicesGrid}>
          {EMERGENCY_SERVICES.map((service) => (
            <View key={service.key} style={styles.serviceItem}>
              <Pressable
                style={styles.serviceCard}
                onPress={() => handleCallPress(service)}
              >
                <Text style={styles.serviceNumber}>{service.phoneNumber}</Text>
                <Text style={styles.serviceLabel} numberOfLines={1}>
                  {service.label}
                </Text>
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share Your Location</Text>
        <AppCard elevation="sm">
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>{'\uD83D\uDCCD'}</Text>
            <Text style={styles.locationPlaceholder}>
              No location attached
            </Text>
          </View>
          <Text style={styles.noticeText}>
            Location services will be connected in a future update.
          </Text>
          {locationNoticeVisible ? (
            <Text style={styles.noticeTextConfirm}>
              GPS is not connected yet — your location cannot be shared
              automatically.
            </Text>
          ) : null}
          <AppButton
            label="Use Current Location"
            onPress={handleUseCurrentLocationPress}
            variant="outline"
          />
        </AppCard>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Alert Emergency Contacts</Text>
        <AppCard elevation="sm">
          <Text style={styles.noticeText}>
            Add trusted contacts so they can be notified when you send an SOS
            alert. This isn&apos;t set up yet in this build.
          </Text>

          {alertNoticeVisible ? (
            <AppCard elevation="none" style={styles.notConnectedCard}>
              <Text style={styles.notConnectedTitle}>
                SOS alerts not connected yet
              </Text>
              <Text style={styles.notConnectedMessage}>
                No alert was sent. Contact notification and location sharing
                will be wired up in a future update — for immediate help, use
                the Emergency Call section above.
              </Text>
            </AppCard>
          ) : null}

          <AppButton
            label="SEND SOS ALERT"
            onPress={handleSendSosAlertPress}
            variant="secondary"
          />
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: theme.spacing.xl,
  },
  lastSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  introCard: {
    borderColor: theme.colors.danger,
  },
  introTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.danger,
    marginBottom: theme.spacing.xs,
  },
  introMessage: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  serviceItem: {
    width: '50%',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  serviceCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 104,
  },
  serviceNumber: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.danger,
    marginBottom: theme.spacing.xs,
  },
  serviceLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  locationPlaceholder: {
    flex: 1,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  noticeText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 16,
  },
  noticeTextConfirm: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.warning,
    marginBottom: theme.spacing.md,
    lineHeight: 16,
  },
  notConnectedCard: {
    borderColor: theme.colors.warning,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  notConnectedTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  notConnectedMessage: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
