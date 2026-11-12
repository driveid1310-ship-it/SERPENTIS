import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import ResultView from '../components/Result/ResultView';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import AppInput from '../components/Input/AppInput';
import OfficialChannelsModal from '../components/FoodSafety/OfficialChannelsModal';
import { useTheme } from '../context/ThemeContext';
import { useReportDetails } from '../hooks/useReportDetails';
import { useAuth } from '../hooks/useAuth';
import { getMyGroupsRequest, type Group } from '../api/groups';
import { initSocket } from '../services/socket';
import type { Comment } from '../types/comment';
import type { ReportStatus } from '../types/report';

type ReportDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ReportDetails'
>;

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function formatRelativeTime(createdAt: string | undefined): string {
  if (!createdAt) return '';
  const createdTimestamp = new Date(createdAt).getTime();
  if (Number.isNaN(createdTimestamp)) return '';
  const elapsedMs = Date.now() - createdTimestamp;
  if (elapsedMs < MINUTE_MS) return 'Just now';
  if (elapsedMs < HOUR_MS) return `${Math.floor(elapsedMs / MINUTE_MS)}m ago`;
  if (elapsedMs < DAY_MS) return `${Math.floor(elapsedMs / HOUR_MS)}h ago`;
  return `${Math.floor(elapsedMs / DAY_MS)}d ago`;
}

interface ReportImageItemProps {
  uri: string;
  theme: any;
  styles: any;
}

function ReportImageItem({ uri, theme, styles }: ReportImageItemProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!uri || typeof uri !== 'string' || uri.trim() === '') {
    return null;
  }

  return (
    <View style={styles.reportImageContainer}>
      {loading && !error && (
        <View style={styles.imageLoadingOverlay}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
        </View>
      )}
      {error ? (
        <View style={styles.imageErrorContainer}>
          <Text style={styles.imageErrorIcon}>📷</Text>
          <Text style={styles.imageErrorText}>Image unavailable</Text>
        </View>
      ) : (
        <Image
          source={{ uri: uri.trim() }}
          style={styles.reportImage}
          resizeMode="cover"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </View>
  );
}

export default function ReportDetailsScreen({
  route,
  navigation,
}: ReportDetailsScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { reportId } = route.params;
  const { user } = useAuth();
  const {
    report,
    comments,
    status,
    errorMessage,
    isPostingComment,
    commentError,
    isUpvoted,
    isObserved,
    retry,
    submitComment,
    toggleUpvote,
    toggleObservation,
    changeStatus,
  } = useReportDetails(reportId);

  const [commentText, setCommentText] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [officialModalVisible, setOfficialModalVisible] = useState(false);
  const [sharedGroup, setSharedGroup] = useState<any>(null);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleOfficialFilingUpdated = useCallback(() => {
    retry();
  }, [retry]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openShareModal = useCallback(async () => {
    setShareModalVisible(true);
    setLoadingGroups(true);
    try {
      const groups = await getMyGroupsRequest();
      setMyGroups(groups);
    } catch {
      setMyGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const shareToGroup = useCallback(async (group: Group) => {
    if (!report || sharing) return;
    setSharing(true);
    try {
      const socket = await initSocket();
      if (!socket) {
        Alert.alert('Error', 'Could not connect to chat.');
        return;
      }
      socket.emit('joinGroup', group._id);
      socket.emit(
        'sendMessage',
        { groupId: group._id, text: `📋 Shared: ${report.title}`, sharedReport: report._id },
        (res: any) => {
          if (res?.success) {
            setShareModalVisible(false);
            setSharedGroup(group);
            
          } else {
            Alert.alert('Error', 'Failed to share report.');
          }
        },
      );
    } catch {
      Alert.alert('Error', 'Failed to share report.');
    } finally {
      setSharing(false);
    }
  }, [report, sharing]);

  const handlePostComment = useCallback(async () => {
    if (!commentText.trim()) return;
    const success = await submitComment(commentText);
    if (success) {
      setCommentText('');
    }
  }, [commentText, submitComment]);

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>
            {item.user?.fullName ??
              (item.user?.email ? item.user.email.split('@')[0] : 'Citizen')}
          </Text>
          <Text style={styles.commentTime}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    ),
    [styles],
  );

  const renderHeader = useCallback(() => {
    if (!report) return null;

    return (
      <View style={styles.detailsContainer}>
        <AppCard elevation="sm" style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <View style={styles.badgeRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{report.category}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {REPORT_STATUS_LABELS[report.status] || report.status}
                    </Text>
                  </View>
                  {report.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedBadgeText}>Verified by Moderator</Text>
                    </View>
                  )}
                  {report.isDuplicate && (
                    <View style={styles.duplicateBadge}>
                      <Text style={styles.duplicateBadgeText}>Duplicate Report</Text>
                    </View>
                  )}
                </View>
            </View>
          </View>

          <Text style={styles.metaText}>
            Reported {formatRelativeTime(report.createdAt)} • Priority:{' '}
            <Text style={styles.priorityText}>{report.priority}</Text>
          </Text>

          <Text style={styles.description}>{report.description}</Text>

          {report.images && report.images.length > 0 ? (
            <View style={styles.imageGallery}>
              {report.images
                .filter((img) => typeof img === 'string' && img.trim().length > 0)
                .map((img, index) => (
                  <ReportImageItem
                    key={`${img}-${index}`}
                    uri={img}
                    theme={theme}
                    styles={styles}
                  />
                ))}
            </View>
          ) : null}

          {(report.category === 'food-safety' || report.foodSafetyDetails) && (
            <View style={styles.foodSafetyBox}>
              <View style={styles.foodSafetyHeaderRow}>
                <Text style={styles.foodSafetyHeaderTitle}>
                  🍽️ Food Safety Details
                </Text>
                <View
                  style={[
                    styles.officialBadge,
                    report.foodSafetyDetails?.officialFiling?.status ===
                    'filed_by_citizen'
                      ? styles.officialBadgeFiled
                      : styles.officialBadgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.officialBadgeText,
                      report.foodSafetyDetails?.officialFiling?.status ===
                      'filed_by_citizen'
                        ? styles.officialBadgeTextFiled
                        : styles.officialBadgeTextPending,
                    ]}
                  >
                    {report.foodSafetyDetails?.officialFiling?.status ===
                    'filed_by_citizen'
                      ? 'Authority Docket Logged'
                      : 'Statutory Filing Needed'}
                  </Text>
                </View>
              </View>

              {report.foodSafetyDetails?.establishmentName ? (
                <View style={styles.foodFieldRow}>
                  <Text style={styles.foodFieldLabel}>Establishment:</Text>
                  <Text style={styles.foodFieldValue}>
                    {report.foodSafetyDetails.establishmentName}
                  </Text>
                </View>
              ) : null}

              {report.foodSafetyDetails?.foodItem ? (
                <View style={styles.foodFieldRow}>
                  <Text style={styles.foodFieldLabel}>Product / Item:</Text>
                  <Text style={styles.foodFieldValue}>
                    {report.foodSafetyDetails.foodItem}
                  </Text>
                </View>
              ) : null}

              {report.foodSafetyDetails?.concernType ? (
                <View style={styles.foodFieldRow}>
                  <Text style={styles.foodFieldLabel}>Concern:</Text>
                  <Text style={styles.foodFieldValue}>
                    {report.foodSafetyDetails.concernType.toUpperCase()}
                  </Text>
                </View>
              ) : null}

              {report.foodSafetyDetails?.officialFiling?.docketNumber ? (
                <View style={styles.docketDisplayRow}>
                  <Text style={styles.docketLabel}>
                    Official Docket ({report.foodSafetyDetails.officialFiling.channelName || 'Regulator'}):
                  </Text>
                  <Text style={styles.docketValue}>
                    {report.foodSafetyDetails.officialFiling.docketNumber}
                  </Text>
                </View>
              ) : null}

              <View style={styles.disclaimerInline}>
                <Text style={styles.disclaimerInlineText}>
                  ⚖️ SERPENTIS is a community civic platform, not an official government regulator. Official statutory enforcement requires lodging a grievance with authorities.
                </Text>
              </View>

              <Pressable
                style={styles.guideActionButton}
                onPress={() => setOfficialModalVisible(true)}
              >
                <Text style={styles.guideActionButtonText}>
                  🏛️ Official Filing Guide & Evidence Dossier ↗
                </Text>
              </Pressable>
            </View>
          )}

          {user && (user.id === report.reportedBy?._id || user.role === 'moderator' || user.role === 'admin') && (
            <View style={styles.moderatorBlock}>
              <Text style={styles.moderatorTitle}>
                {user.role === 'moderator' || user.role === 'admin' ? 'Moderator Tools' : 'Manage Your Report'}
              </Text>
              <View style={styles.modButtons}>
                {report.status !== 'in-progress' && (
                  <AppButton 
                    label="Mark In Progress" 
                    onPress={() => changeStatus('in-progress')} 
                    variant="outline" 
                  />
                )}
                {report.status !== 'resolved' && (
                  <AppButton 
                    label="Mark Resolved" 
                    onPress={() => changeStatus('resolved')} 
                  />
                )}
              </View>
            </View>
          )}

          
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.upvoteButton, isUpvoted && styles.upvoteButtonActive]}
              onPress={toggleUpvote}
            >
              <Text
                style={[
                  styles.upvoteButtonText,
                  isUpvoted && styles.upvoteButtonTextActive,
                ]}
              >
                👍 Support ({report.upvotes?.length || 0})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.observeButton, isObserved && styles.observeButtonActive]}
              onPress={toggleObservation}
            >
              <Text
                style={[
                  styles.observeButtonText,
                  isObserved && styles.observeButtonTextActive,
                ]}
              >
                👁️ Personally Observed ({(report.personallyObserved && report.personallyObserved.length) || 0})
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.shareButton}
            onPress={openShareModal}
          >
            <Text style={styles.shareButtonText}>
              📢 Discuss in Community
            </Text>
          </Pressable>

        </AppCard>

        <Text style={styles.sectionTitle}>Community Comments</Text>
      </View>
    );
  }, [report, isUpvoted, toggleUpvote, isObserved, toggleObservation, user, changeStatus, openShareModal, styles, theme]);

  const renderEmptyComments = useCallback(() => {
    return (
      <View style={styles.emptyComments}>
        <Text style={styles.emptyCommentsText}>
          No comments yet. Be the first to share an update!
        </Text>
      </View>
    );
  }, [styles]);

  
  if (sharedGroup) {
    return (
      <ResultView
        status="success"
        title="REPORT SHARED"
        description="The report has been shared with your selected community group."
        primaryAction={{
          label: 'OPEN GROUP',
          onPress: () => {
            const gid = sharedGroup._id;
            setSharedGroup(null);
            navigation.navigate('GroupDetails', { groupId: gid });
          }
        }}
        secondaryAction={{
          label: 'DONE',
          onPress: () => setSharedGroup(null)
        }}
      />
    );
  }

  if (status === 'loading' && !report) {
    return (
      <Screen scrollable={false}>
        <Header title="Report Details" onBackPress={handleBackPress} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </Screen>
    );
  }

  if (status === 'error' && !report) {
    return (
      <Screen scrollable={false}>
        <Header title="Report Details" onBackPress={handleBackPress} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {errorMessage ?? 'Failed to load report.'}
          </Text>
          <AppButton label="Retry" onPress={retry} variant="outline" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false} contentContainerStyle={styles.screenContent}>
      <Header title="Report Details" onBackPress={handleBackPress} />

      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        renderItem={renderComment}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComments}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.composerContainer}>
        {commentError ? (
          <Text style={styles.composerError}>{commentError}</Text>
        ) : null}
        <View style={styles.composerInputRow}>
          <AppInput
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            containerStyle={styles.composerInput}
            multiline
            maxLength={500}
            editable={!isPostingComment}
          />
          <AppButton
            label="Post"
            onPress={handlePostComment}
            variant="primary"
            style={styles.composerButton}
            disabled={!commentText.trim() || isPostingComment}
            loading={isPostingComment}
          />
        </View>
      </View>

      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share to Community Group</Text>
            {loadingGroups ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : myGroups.length === 0 ? (
              <Text style={styles.modalEmpty}>You have not joined any groups yet.</Text>
            ) : (
              <ScrollView style={styles.modalList}>
                {myGroups.map((g) => (
                  <Pressable
                    key={g._id}
                    style={styles.modalGroupItem}
                    onPress={() => shareToGroup(g)}
                    disabled={sharing}
                  >
                    <Text style={styles.modalGroupName}>{g.name}</Text>
                    <Text style={styles.modalGroupMeta}>{g.memberCount} members</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <Pressable
              style={styles.modalCancel}
              onPress={() => setShareModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {report ? (
        <OfficialChannelsModal
          visible={officialModalVisible}
          onClose={() => setOfficialModalVisible(false)}
          report={report}
          onFilingUpdated={handleOfficialFilingUpdated}
          theme={theme}
        />
      ) : null}
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screenContent: {
    paddingHorizontal: 0,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
  },
  errorText: {
    marginBottom: theme.spacing.md,
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.md,
    textAlign: 'center',
  },
  detailsContainer: {
    paddingTop: theme.spacing.md,
  },
  reportCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  reportHeader: {
    marginBottom: theme.spacing.sm,
  },
  titleRow: {
    gap: theme.spacing.sm,
  },
  reportTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.primary,
  },
  statusBadge: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textSecondary,
  },
  verifiedBadge: {
    backgroundColor: theme.colors.success + '20',
    borderWidth: 1,
    borderColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.success,
  },
  duplicateBadge: {
    backgroundColor: theme.colors.error + '20',
    borderWidth: 1,
    borderColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  duplicateBadgeText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.error,
  },
  metaText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  priorityText: {
    fontWeight: theme.typography.fontWeights.bold,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  imageGallery: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  reportImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFill as any,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1,
  },
  imageErrorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  imageErrorIcon: {
    fontSize: 28,
    marginBottom: theme.spacing.xs,
  },
  imageErrorText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  moderatorBlock: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  moderatorTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
  },
  upvoteButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  upvoteButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  upvoteButtonTextActive: {
    color: theme.colors.primary,
  },
  observeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
  },
  observeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  observeButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  observeButtonTextActive: {
    color: theme.colors.primary,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  commentItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  commentAuthor: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  commentTime: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.placeholder,
  },
  commentContent: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  emptyComments: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  composerContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
  },
  composerError: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.xs,
    marginBottom: theme.spacing.xs,
  },
  composerInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  composerInput: {
    flex: 1,
    marginBottom: 0,
    maxHeight: 100,
  },
  composerButton: {
    height: 48,
    paddingHorizontal: theme.spacing.md,
  },
  shareButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  shareButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: theme.typography.fontSizes.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  modalEmpty: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  modalList: {
    maxHeight: 300,
  },
  modalGroupItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalGroupName: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalGroupMeta: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  modalCancel: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    color: theme.colors.error,
    fontWeight: '600',
    fontSize: theme.typography.fontSizes.md,
  },
  foodSafetyBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  foodSafetyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
    gap: 6,
  },
  foodSafetyHeaderTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  officialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
  },
  officialBadgeFiled: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10B981',
  },
  officialBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: '#F59E0B',
  },
  officialBadgeText: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeights.bold,
  },
  officialBadgeTextFiled: {
    color: '#059669',
  },
  officialBadgeTextPending: {
    color: '#D97706',
  },
  foodFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  foodFieldLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  foodFieldValue: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.bold,
    flex: 1,
    textAlign: 'right',
  },
  docketDisplayRow: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  docketLabel: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  docketValue: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginTop: 2,
  },
  disclaimerInline: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xs,
    marginVertical: theme.spacing.sm,
  },
  disclaimerInlineText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },
  guideActionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  guideActionButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
  },
});
