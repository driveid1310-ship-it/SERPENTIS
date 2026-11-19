import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import ResultView from '../components/Result/ResultView';
import Header from '../components/Header/Header';
import AppButton from '../components/Button/AppButton';
import { useTheme } from '../context/ThemeContext';
import { createGroupRequest } from '../api/groups';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGroup'>;

export default function CreateGroupScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Civic');
  const [loading, setLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<any>(null);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      setLoading(true);
      const newGroup = await createGroupRequest({ name: name.trim(), description: description.trim(), category });
      setCreatedGroup(newGroup);
    } catch {
      Alert.alert('Error', 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  
  if (createdGroup) {
    return (
      <ResultView
        status="success"
        title="GROUP CREATED"
        description="Your community group has been successfully created."
        primaryAction={{
          label: 'OPEN GROUP',
          onPress: () => navigation.replace('GroupDetails', { groupId: createdGroup._id })
        }}
        secondaryAction={{
          label: 'DONE',
          onPress: () => navigation.goBack()
        }}
      />
    );
  }

  return (
    <Screen keyboardAvoiding>
      <Header title="Create Group" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Bandra Clean Up"
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Civic, Heritage, Safety"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What is this group about?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <AppButton label="Create Community" onPress={handleCreate} disabled={loading || !name || !description} />
      </ScrollView>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  content: { padding: theme.spacing.md, gap: theme.spacing.xl },
  inputGroup: { gap: theme.spacing.sm },
  label: { fontSize: theme.typography.fontSizes.sm, fontWeight: '600', color: theme.colors.text },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  textArea: { minHeight: 100 },
});
