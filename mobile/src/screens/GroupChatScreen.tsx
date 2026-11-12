import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Header from '../components/Header/Header';

import { useTheme } from '../context/ThemeContext';
import { getGroupMessagesRequest, GroupMessage } from '../api/groups';
import { initSocket, getSocket } from '../services/socket';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupChat'>;

export default function GroupChatScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { groupId, groupName } = route.params;
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketNotice, setSocketNotice] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let isActive = true;
    let onNewMessage: ((msg: GroupMessage) => void) | null = null;
    let onConnect: (() => void) | null = null;
    let onDisconnect: (() => void) | null = null;
    let onConnectError: (() => void) | null = null;

    const setup = async () => {
      try {
        const hist = await getGroupMessagesRequest(groupId, 1);
        if (isActive) {
          setMessages(hist); // sorted desc from backend
        }

        const socket = await initSocket();
        if (socket && isActive) {
          setSocketConnected(socket.connected);
          socket.emit('joinGroup', groupId);

          onConnect = () => {
            if (!isActive) return;
            setSocketConnected(true);
            setSocketNotice(null);
            socket.emit('joinGroup', groupId);
          };

          onDisconnect = () => {
            if (!isActive) return;
            setSocketConnected(false);
            setSocketNotice('Chat disconnected. Reconnecting automatically...');
          };

          onConnectError = () => {
            if (!isActive) return;
            setSocketConnected(false);
            setSocketNotice('Unable to reach live chat server. Retrying...');
          };

          onNewMessage = (msg: GroupMessage) => {
            setMessages(prev => [msg, ...prev]);
          };

          socket.on('connect', onConnect);
          socket.on('disconnect', onDisconnect);
          socket.on('connect_error', onConnectError);
          socket.on('newMessage', onNewMessage);
        }
      } catch (err) {
        console.error('Chat setup failed', err);
        if (isActive) {
          setSocketNotice('Failed to load group chat history.');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    setup();

    return () => {
      isActive = false;
      const socket = getSocket();
      if (socket) {
        socket.emit('leaveGroup', groupId);
        if (onConnect) socket.off('connect', onConnect);
        if (onDisconnect) socket.off('disconnect', onDisconnect);
        if (onConnectError) socket.off('connect_error', onConnectError);
        if (onNewMessage) socket.off('newMessage', onNewMessage);
      }
    };
  }, [groupId]);

  const handleSend = () => {
    if (!text.trim()) return;
    const socket = getSocket();
    if (!socket || !socket.connected) {
      setSocketNotice('Cannot send message while disconnected. Waiting to reconnect...');
      return;
    }
    socket.emit('sendMessage', { groupId, text: text.trim() }, (res: any) => {
      if (res && res.error) {
        setSocketNotice(String(res.error));
      }
    });
    setText('');
  };

  const renderMessage = useCallback(({ item }: { item: GroupMessage }) => {
    const isMe = item.sender._id === user?.id;
    const reportRef = item.sharedReport;
    const reportId = typeof reportRef === 'string' ? reportRef : (reportRef && typeof reportRef === 'object' ? (reportRef as any)._id : null);
    const reportTitle = typeof reportRef === 'object' && reportRef !== null && (reportRef as any).title ? (reportRef as any).title : 'Shared Report';
    const reportMeta = typeof reportRef === 'object' && reportRef !== null && (reportRef as any).category ? `${(reportRef as any).category} • ${(reportRef as any).status || ''}` : null;

    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        {!isMe && <Text style={styles.senderName}>{item.sender.fullName}</Text>}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>{item.text}</Text>
          {reportId && (
            <Pressable
              style={styles.sharedReportCard}
              onPress={() => navigation.navigate('ReportDetails', { reportId })}
            >
              <Text style={styles.sharedReportTitle}>{reportTitle}</Text>
              {reportMeta && <Text style={styles.sharedReportMeta}>{reportMeta}</Text>}
              <Text style={styles.sharedReportTap}>Tap to view report →</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }, [user, navigation, styles]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        title={groupName}
        subtitle={socketConnected ? 'Live chat connected' : 'Connecting...'}
        onBackPress={() => navigation.goBack()}
      />

      {socketNotice ? (
        <View style={styles.connectionBanner}>
          <Text style={styles.connectionBannerText}>{socketNotice}</Text>
        </View>
      ) : null}
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={1000}
        />
        <Pressable 
          onPress={handleSend} 
          style={({ pressed }) => [
            styles.sendBtn,
            pressed && { opacity: 0.7 },
            !text.trim() && { opacity: 0.3 }
          ]} 
          disabled={!text.trim()}
          accessibilityRole="button"
          accessibilityLabel="Send Message"
        >
          <Text style={styles.sendIconText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1 },
  listContent: { padding: theme.spacing.md, gap: theme.spacing.sm },
  messageWrapper: { maxWidth: '80%', marginVertical: 4 },
  myMessageWrapper: { alignSelf: 'flex-end' },
  theirMessageWrapper: { alignSelf: 'flex-start' },
  senderName: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2, marginLeft: 4 },
  bubble: { padding: theme.spacing.md, borderRadius: theme.radius.lg },
  myBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  messageText: { fontSize: theme.typography.fontSizes.md },
  myMessageText: { color: theme.colors.background },
  theirMessageText: { color: theme.colors.text },
  inputContainer: { flexDirection: 'row', padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.border, alignItems: 'flex-end', gap: theme.spacing.sm },
  input: { flex: 1, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.sm, paddingTop: Platform.OS === 'ios' ? 12 : 8, paddingBottom: Platform.OS === 'ios' ? 12 : 8, color: theme.colors.text, minHeight: 44, maxHeight: 120, fontSize: theme.typography.fontSizes.md },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sendIconText: { color: theme.colors.background, fontSize: 18, marginLeft: 2 },
  sharedReportCard: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: theme.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  sharedReportTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sharedReportMeta: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  sharedReportTap: {
    fontSize: 10,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  connectionBanner: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderColor: theme.colors.warning ?? theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  connectionBannerText: {
    fontSize: 12,
    color: theme.colors.warning ?? theme.colors.textSecondary,
  },
});
