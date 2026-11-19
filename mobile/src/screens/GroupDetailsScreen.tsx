import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppButton from '../components/Button/AppButton';
import { useTheme } from '../context/ThemeContext';
import { getGroupDetailsRequest, joinGroupRequest, leaveGroupRequest, Group } from '../api/groups';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetails'>;

export default function GroupDetailsScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(null);
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGroupDetailsRequest(groupId);
      setGroup(data.group);
      setMembership(data.membership);
    } catch {
      Alert.alert('Error', 'Failed to load group details.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleJoin = async () => {
    try {
      setActionLoading(true);
      await joinGroupRequest(groupId);
      fetchDetails();
    } catch {
      Alert.alert('Error', 'Failed to join group.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      setActionLoading(true);
      await leaveGroupRequest(groupId);
      fetchDetails();
    } catch {
      Alert.alert('Error', 'Failed to leave group.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenChat = () => {
    navigation.navigate('GroupChat', { groupId, groupName: group?.name || 'Chat' });
  };

  if (loading || !group) {
    return (
      <Screen>
        <Header title="Group Details" onBackPress={() => navigation.goBack()} />
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Group Details" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{group.name}</Text>
        <Text style={styles.category}>{group.category} • {group.memberCount} Members</Text>
        <Text style={styles.desc}>{group.description}</Text>

        <View style={styles.actions}>
          {membership ? (
            <>
              <AppButton label="Open Chat" onPress={handleOpenChat} />
              <AppButton label="Leave Group" onPress={handleLeave} variant="outline" disabled={actionLoading} />
            </>
          ) : (
            <AppButton label="Join Group" onPress={handleJoin} disabled={actionLoading} />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  loader: { marginTop: 40 },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  title: { fontSize: theme.typography.fontSizes.xl, fontWeight: 'bold', color: theme.colors.text },
  category: { fontSize: theme.typography.fontSizes.sm, color: theme.colors.primary },
  desc: { fontSize: theme.typography.fontSizes.md, color: theme.colors.textSecondary, lineHeight: 22 },
  actions: { marginTop: theme.spacing.xl, gap: theme.spacing.md },
});
