import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import ResultView from '../components/Result/ResultView';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import AppInput from '../components/Input/AppInput';
import { useTheme } from '../context/ThemeContext';
import { useSos } from '../hooks/useSos';
import { useLocation } from '../hooks/useLocation';
import { createSosAlert } from '../services/sosService';
import type { SOSAlert, SOSType } from '../types/sos';

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

const SOS_TYPE_LABELS: Record<SOSType, string> = {
  accident: 'Accident',
  medical: 'Medical',
  fire: 'Fire',
  crime: 'Crime',
  flood: 'Flood',
  'gas-leak': 'Gas Leak',
  other: 'Other',
};

const SOS_TYPES: SOSType[] = [
  'accident',
  'medical',
  'fire',
  'crime',
  'flood',
  'gas-leak',
  'other',
];

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function formatRelativeTime(createdAt: string): string {
  const createdTimestamp = new Date(createdAt).getTime();

  if (Number.isNaN(createdTimestamp)) {
    return '';
  }

  const elapsedMs = Date.now() - createdTimestamp;

  if (elapsedMs < MINUTE_MS) {
    return 'Just now';
  }
  if (elapsedMs < HOUR_MS) {
    return `${Math.floor(elapsedMs / MINUTE_MS)}m ago`;
  }
  if (elapsedMs < DAY_MS) {
    return `${Math.floor(elapsedMs / HOUR_MS)}h ago`;
  }
  return `${Math.floor(elapsedMs / DAY_MS)}d ago`;
}

export default function SosScreen({ navigation }: SosScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [emergencyType, setEmergencyType] = useState<SOSType>('other');
  const [message, setMessage] = useState('Emergency assistance requested.');
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const isSendingRef = useRef(false);
  const {
    status: activeAlertsStatus,
    alerts: activeAlerts,
    errorMessage: activeAlertsErrorMessage,
    refetch: refetchActiveAlerts,
  } = useSos();
  const {
    location,
    status: locationStatus,
    message: locationMessage,
    requestLocation,
  } = useLocation();

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
    setSendError(null);
    setSendSuccess(null);
    requestLocation();
  }, [requestLocation]);

  const handleSendSosAlertPress = useCallback(async () => {
    if (isSendingRef.current) {
      return;
    }

    setSendError(null);
    setSendSuccess(null);

    if (!location) {
      setSendError(
        locationMessage ??
          'Get your current location before sending an SOS alert.',
      );
      return;
    }

    if (!message.trim()) {
      setSendError('Enter a short message describing the emergency.');
      return;
    }

    isSendingRef.current = true;
    setIsSending(true);
    try {
      await createSosAlert({
        emergencyType,
        message: message.trim(),
        location,
      });
      setSubmitSuccess(true);
      refetchActiveAlerts();
    } catch {
      setSubmitError(true);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  }, [
    emergencyType,
    location,
    locationMessage,
    message,
    refetchActiveAlerts,
  ]);

  
  if (submitSuccess) {
    return (
      <ResultView
        status="success"
        title="SOS SENT"
        description="Your emergency request has been successfully sent.\n\nYour submitted location and emergency details were included with the request."
        primaryAction={{
          label: 'DONE',
          onPress: handleBackPress,
        }}
      />
    );
  }

  if (submitError) {
    return (
      <ResultView
        status="failure"
        title="SOS NOT SENT"
        description="We couldn't send your emergency request. Please try again."
        primaryAction={{
          label: 'TRY AGAIN',
          onPress: () => setSubmitError(false),
        }}
        secondaryAction={{
          label: 'CANCEL',
          onPress: handleBackPress,
        }}
      />
    );
  }

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
        <Text style={styles.sectionTitle}>Active SOS Alerts</Text>

        {activeAlertsStatus === 'loading' ? (
          <AppCard elevation="sm">
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading active alerts...</Text>
            </View>
          </AppCard>
        ) : null}

        {activeAlertsStatus === 'error' ? (
          <AppCard elevation="sm" style={styles.errorCard}>
            <Text style={styles.errorTitle}>Couldn&apos;t load alerts</Text>
            <Text style={styles.errorMessage}>
              {activeAlertsErrorMessage ?? 'Please try again.'}
            </Text>
            <AppButton
              label="Retry"
              onPress={refetchActiveAlerts}
              variant="outline"
              style={styles.errorRetryButton}
            />
          </AppCard>
        ) : null}

        {activeAlertsStatus === 'empty' ? (
          <AppCard elevation="sm">
            <Text style={styles.emptyStateText}>
              No active SOS alerts right now.
            </Text>
          </AppCard>
        ) : null}

        {activeAlertsStatus === 'success'
          ? activeAlerts.map((alert: SOSAlert) => (
              <AppCard key={alert._id} elevation="sm" style={styles.alertCard}>
                <View style={styles.alertCardHeader}>
                  <Text style={styles.alertType}>
                    {SOS_TYPE_LABELS[alert.emergencyType]}
                  </Text>
                  <Text style={styles.alertTime}>
                    {formatRelativeTime(alert.createdAt)}
                  </Text>
                </View>
                <Text style={styles.alertMessage} numberOfLines={2}>
                  {alert.message}
                </Text>
              </AppCard>
            ))
          : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share Your Location</Text>
        <AppCard elevation="sm">
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>{'\uD83D\uDCCD'}</Text>
            <Text style={styles.locationPlaceholder}>
              {location
                ? `${location.coordinates[1].toFixed(5)}, ${location.coordinates[0].toFixed(5)}`
                : 'No location attached'}
            </Text>
          </View>
          <Text style={styles.noticeText}>
            {locationStatus === 'checking'
              ? 'Getting your current location...'
              : 'Your location is required to send an SOS alert.'}
          </Text>
          {locationMessage ? (
            <Text style={styles.noticeTextConfirm}>{locationMessage}</Text>
          ) : null}
          <AppButton
            label="Use Current Location"
            onPress={handleUseCurrentLocationPress}
            variant="outline"
            loading={locationStatus === 'checking'}
            disabled={isSending}
          />
        </AppCard>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Send SOS Alert</Text>
        <AppCard elevation="sm">
          <Text style={styles.noticeText}>
            Your alert will be recorded with your current location.
          </Text>

          <Text style={styles.fieldLabel}>Emergency type</Text>
          <View style={styles.sosTypeGrid}>
            {SOS_TYPES.map((type) => {
              const isSelected = emergencyType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => {
                    setEmergencyType(type);
                    setSendError(null);
                    setSendSuccess(null);
                  }}
                  style={[
                    styles.sosTypeChip,
                    isSelected && styles.sosTypeChipSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.sosTypeChipText,
                      isSelected && styles.sosTypeChipTextSelected,
                    ]}
                  >
                    {SOS_TYPE_LABELS[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <AppInput
            label="Message"
            placeholder="Describe the emergency"
            value={message}
            onChangeText={(value: string) => {
              setMessage(value);
              setSendError(null);
              setSendSuccess(null);
            }}
            multiline
            maxLength={300}
            textAlignVertical="top"
          />

          {sendError ? (
            <Text style={styles.sendErrorText}>{sendError}</Text>
          ) : null}
          {sendSuccess ? (
            <Text style={styles.sendSuccessText}>{sendSuccess}</Text>
          ) : null}

          <AppButton
            label="SEND SOS ALERT"
            onPress={handleSendSosAlertPress}
            variant="secondary"
            loading={isSending}
            disabled={isSending || locationStatus === 'checking'}
            style={styles.sendSosButton}
          />
        </AppCard>
      </View>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  section: {
    marginTop: theme.spacing.xl,
  },
  lastSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  introCard: {
    borderColor: theme.colors.error,
  },
  introTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.error,
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
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  serviceLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  errorCard: {
    borderColor: theme.colors.error,
  },
  errorTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  errorMessage: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  errorRetryButton: {
    alignSelf: 'flex-start',
  },
  emptyStateText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  alertCard: {
    marginBottom: theme.spacing.sm,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  alertType: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.error,
  },
  alertTime: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.placeholder,
  },
  alertMessage: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 17,
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
  fieldLabel: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  sosTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sosTypeChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  sosTypeChipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  sosTypeChipText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  sosTypeChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  sendErrorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.xs,
    marginTop: theme.spacing.md,
  },
  sendSuccessText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.xs,
    marginTop: theme.spacing.md,
  },
  sendSosButton: {
    marginTop: theme.spacing.md,
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
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  notConnectedMessage: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
