import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import { useTheme } from '../context/ThemeContext';
import { getGroupsRequest, Group } from '../api/groups';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Community'>;

export default function CommunityScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGroupsRequest(undefined, search);
      setGroups(data);
    } catch {
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups])
  );

  return (
    <Screen keyboardAvoiding={false}>
      <Header title="Community" subtitle="Connect with your civic groups" onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchGroups}
            placeholderTextColor={theme.colors.textSecondary}
          />
          <AppButton label="Create" onPress={() => navigation.navigate('CreateGroup')} style={styles.createButton} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <AppButton label="Retry" onPress={fetchGroups} variant="outline" />
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No groups found. Be the first to start one!</Text>
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate('GroupDetails', { groupId: item._id })}>
                <AppCard style={styles.groupCard}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  <Text style={styles.groupCategory}>{item.category}</Text>
                  <Text style={styles.groupDesc} numberOfLines={2}>{item.description}</Text>
                  <Text style={styles.memberCount}>Members: {item.memberCount}</Text>
                </AppCard>
              </Pressable>
            )}
          />
        )}
      </View>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  content: { flex: 1, padding: theme.spacing.md },
  searchContainer: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  searchInput: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md, backgroundColor: theme.colors.surface, color: theme.colors.text },
  createButton: { flexShrink: 0 },
  loader: { marginTop: theme.spacing.xl },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: theme.colors.error, marginBottom: theme.spacing.md },
  emptyText: { color: theme.colors.textSecondary },
  listContent: { gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
  groupCard: { padding: theme.spacing.md },
  groupName: { fontSize: theme.typography.fontSizes.md, fontWeight: 'bold', color: theme.colors.text },
  groupCategory: { fontSize: theme.typography.fontSizes.xs, color: theme.colors.primary, marginTop: 4 },
  groupDesc: { fontSize: theme.typography.fontSizes.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
  memberCount: { fontSize: theme.typography.fontSizes.xs, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
});
