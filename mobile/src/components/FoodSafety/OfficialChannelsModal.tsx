import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import type { Report } from '../../types/report';
import {
  OFFICIAL_FOOD_SAFETY_CHANNELS,
  FILING_EVIDENCE_CHECKLIST,
  OFFICIAL_GOVERNMENT_DISCLAIMER,
  type OfficialChannel,
} from '../../constants/foodSafetyChannels';
import { generateComplaintDossier } from '../../utils/complaintDossier';
import { updateOfficialFilingRequest } from '../../api/reports';

interface OfficialChannelsModalProps {
  visible: boolean;
  onClose: () => void;
  report: Report;
  onFilingUpdated: (updatedReport: Report) => void;
  theme: any;
}

export default function OfficialChannelsModal({
  visible,
  onClose,
  report,
  onFilingUpdated,
  theme,
}: OfficialChannelsModalProps) {
  const [activeTab, setActiveTab] = useState<'channels' | 'dossier' | 'record'>('channels');
  const [docketNumber, setDocketNumber] = useState(
    report.foodSafetyDetails?.officialFiling?.docketNumber || '',
  );
  const [channelName, setChannelName] = useState(
    report.foodSafetyDetails?.officialFiling?.channelName || 'FSSAI Food Safety Connect',
  );
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);

  const handleOpenLink = useCallback(async (url?: string) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to open link', url);
      }
    } catch {
      Alert.alert('Error', 'Could not open the official government portal.');
    }
  }, []);

  const handleCallPhone = useCallback(async (phone?: string) => {
    if (!phone) return;
    const telUrl = `tel:${phone}`;
    try {
      await Linking.openURL(telUrl);
    } catch {
      Alert.alert('Error', `Could not initiate call to ${phone}.`);
    }
  }, []);

  const handleSaveOfficialRecord = useCallback(async () => {
    if (!docketNumber.trim()) {
      Alert.alert('Reference Required', 'Please provide an official acknowledgment or docket number.');
      return;
    }

    setIsSubmittingRecord(true);
    try {
      const response = await updateOfficialFilingRequest(report._id, {
        status: 'filed_by_citizen',
        docketNumber: docketNumber.trim(),
        channelName: channelName.trim(),
        filingDate: new Date().toISOString(),
      });

      if (response.success && response.data?.report) {
        onFilingUpdated(response.data.report);
        Alert.alert('Recorded', 'Your official government complaint reference has been saved.');
        setActiveTab('channels');
      } else {
        Alert.alert('Error', response.message || 'Failed to update official complaint record.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Network error.';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmittingRecord(false);
    }
  }, [docketNumber, channelName, report._id, onFilingUpdated]);

  const dossierText = generateComplaintDossier(report);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Official Complaint Guide
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Statutory Channels & Evidence Dossier
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>Done</Text>
          </Pressable>
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'channels' && [styles.activeTabItem, { borderColor: theme.colors.primary }],
            ]}
            onPress={() => setActiveTab('channels')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'channels' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              Portals & Hotlines
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'dossier' && [styles.activeTabItem, { borderColor: theme.colors.primary }],
            ]}
            onPress={() => setActiveTab('dossier')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'dossier' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              Complaint Dossier
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'record' && [styles.activeTabItem, { borderColor: theme.colors.primary }],
            ]}
            onPress={() => setActiveTab('record')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'record' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              Log Docket #
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Statutory Disclaimer Card */}
          <View
            style={[
              styles.disclaimerCard,
              { backgroundColor: theme.colors.card, borderColor: '#F59E0B' },
            ]}
          >
            <Text style={styles.disclaimerHeader}>⚠️ Official Authority Disclaimer</Text>
            <Text style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
              {OFFICIAL_GOVERNMENT_DISCLAIMER}
            </Text>
          </View>

          {activeTab === 'channels' && (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Authorized Statutory Portals
              </Text>
              {OFFICIAL_FOOD_SAFETY_CHANNELS.map((channel: OfficialChannel) => (
                <View
                  key={channel.id}
                  style={[styles.channelCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                >
                  <View style={styles.channelHeader}>
                    <Text style={[styles.channelName, { color: theme.colors.text }]}>
                      {channel.name}
                    </Text>
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{channel.badge}</Text>
                    </View>
                  </View>

                  <Text style={[styles.authorityText, { color: theme.colors.textSecondary }]}>
                    {channel.authority}
                  </Text>
                  <Text style={[styles.channelDesc, { color: theme.colors.text }]}>
                    {channel.description}
                  </Text>

                  <View style={styles.recommendedContainer}>
                    <Text style={[styles.recommendedLabel, { color: theme.colors.textSecondary }]}>
                      Best for: <Text style={styles.recommendedValue}>{channel.recommendedFor}</Text>
                    </Text>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    {channel.url && (
                      <Pressable
                        style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => handleOpenLink(channel.url)}
                      >
                        <Text style={styles.actionBtnText}>Open Portal ↗</Text>
                      </Pressable>
                    )}
                    {channel.phone && (
                      <Pressable
                        style={[styles.actionBtn, styles.callBtn]}
                        onPress={() => handleCallPhone(channel.phone)}
                      >
                        <Text style={styles.actionBtnText}>Call {channel.phone} 📞</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}

              <View style={[styles.checklistCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>
                  📋 Evidence Required by Regulators
                </Text>
                {FILING_EVIDENCE_CHECKLIST.map((item, idx) => (
                  <View key={idx} style={styles.checklistItem}>
                    <Text style={[styles.checklistBullet, { color: theme.colors.primary }]}>✓</Text>
                    <Text style={[styles.checklistText, { color: theme.colors.textSecondary }]}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'dossier' && (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Standardized Complaint Dossier
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Use this structured evidence sheet when submitting your complaint into statutory portals.
              </Text>

              <View
                style={[
                  styles.dossierBox,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
              >
                <TextInput
                  value={dossierText}
                  multiline
                  editable={false}
                  selectTextOnFocus
                  style={[styles.dossierInput, { color: theme.colors.text }]}
                />
              </View>
            </View>
          )}

          {activeTab === 'record' && (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Record Official Government Reference
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                If you have lodged a formal complaint on FSSAI FoSCoS or NCH, record your official docket number below to track progress alongside the community.
              </Text>

              <View
                style={[
                  styles.formCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Filing Channel / Authority
                </Text>
                <TextInput
                  value={channelName}
                  onChangeText={setChannelName}
                  placeholder="e.g. FSSAI Food Safety Connect / NCH 1915"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.textInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                />

                <Text style={[styles.inputLabel, styles.inputLabelSpaced, { color: theme.colors.text }]}>
                  Official Docket / Reference Number *
                </Text>
                <TextInput
                  value={docketNumber}
                  onChangeText={setDocketNumber}
                  placeholder="e.g. FSSAI-2026-98124 or Docket #1915"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.textInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                />

                <Pressable
                  style={[styles.saveRecordBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSaveOfficialRecord}
                  disabled={isSubmittingRecord}
                >
                  {isSubmittingRecord ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.saveRecordBtnText}>Save Official Reference</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabItem: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  disclaimerCard: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  disclaimerHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 17,
  },
  channelCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  badgeContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  authorityText: {
    fontSize: 11,
    marginBottom: 8,
  },
  channelDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  recommendedContainer: {
    marginBottom: 12,
  },
  recommendedLabel: {
    fontSize: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    backgroundColor: '#059669',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  checklistCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  checklistBullet: {
    fontWeight: '800',
    fontSize: 14,
  },
  checklistText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  dossierBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  dossierInput: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputLabelSpaced: {
    marginTop: 14,
  },
  recommendedValue: {
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveRecordBtn: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveRecordBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
