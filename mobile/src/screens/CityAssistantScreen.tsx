import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import AppInput from '../components/Input/AppInput';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import { askAssistantRequest, getAssistantSummaryRequest } from '../api/environment';

type Props = NativeStackScreenProps<RootStackParamList, 'CityAssistant'>;

const SUGGESTED_QUESTIONS = [
  'Is the air quality safe today?',
  'Should I exercise outdoors?',
  'Will it rain in my area?',
  'What precautions should I take for heat?',
  'Which nearby areas have waterlogging?',
];

export default function CityAssistantScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity } = useCity();

  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [reply, setReply] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    getAssistantSummaryRequest({ slug: selectedCity.slug })
      .then((res) => {
        if (res.success && 'data' in res) setSummary(res.data);
      })
      .catch(() => {});
  }, [selectedCity.slug]);

  const handleAsk = useCallback(
    async (qText?: string) => {
      const target = (qText ?? question).trim();
      if (target.length < 3) return;
      if (qText) setQuestion(qText);
      setAsking(true);
      try {
        const res = await askAssistantRequest({
          question: target,
          slug: selectedCity.slug,
        });
        if (res.success && 'data' in res) {
          setReply(res.data);
        }
      } catch {
        setReply({
          answer: 'Unable to reach City Intelligence Assistant. Check your connection and try again.',
          provider: 'Offline',
          disclaimer: '',
          sources: [],
        });
      } finally {
        setAsking(false);
      }
    },
    [question, selectedCity.slug],
  );

  return (
    <Screen scrollable keyboardAvoiding>
      <Header
        title="City Intelligence Assistant"
        subtitle={`Live Q&A & Pattern Insights • ${selectedCity.name}`}
        onBackPress={() => navigation.goBack()}
      />

      {summary ? (
        <AppCard style={styles.card}>
          <Text style={styles.eyebrow}>DAILY CITY BRIEFING</Text>
          <Text style={styles.bodyText}>{summary.dailySummary}</Text>
          <Text style={styles.metaText}>{summary.patterns?.predictiveNote}</Text>
        </AppCard>
      ) : null}

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>ASK ABOUT YOUR CITY</Text>
        <View style={styles.chipsWrap}>
          {SUGGESTED_QUESTIONS.map((q) => (
            <Pressable key={q} onPress={() => handleAsk(q)} style={styles.chip}>
              <Text style={styles.chipText}>{q}</Text>
            </Pressable>
          ))}
        </View>
        <AppInput
          placeholder="Ask about AQI, rain, heat, or hotspots..."
          value={question}
          onChangeText={setQuestion}
        />
        <View style={styles.spacer} />
        <AppButton
          label={asking ? 'Analyzing Live Data...' : 'Ask SERPENTIS'}
          onPress={() => handleAsk()}
          loading={asking}
        />
      </AppCard>

      {asking ? (
        <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
      ) : null}

      {reply ? (
        <AppCard style={styles.card}>
          <Text style={styles.eyebrow}>{reply.provider}</Text>
          <Text style={styles.answerText}>{reply.answer}</Text>
          {reply.sources?.length > 0 ? (
            <Text style={styles.sourcesText}>Sources: {reply.sources.join(' • ')}</Text>
          ) : null}
          {reply.disclaimer ? <Text style={styles.metaText}>{reply.disclaimer}</Text> : null}
        </AppCard>
      ) : null}
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    card: { marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.md, padding: theme.spacing.md },
    eyebrow: { fontSize: 11, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 6 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 8 },
    bodyText: { fontSize: 13, color: theme.colors.text, lineHeight: 19, marginBottom: 6 },
    metaText: { fontSize: 11, color: theme.colors.textTertiary, marginTop: 6 },
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipText: { fontSize: 11, color: theme.colors.primary },
    spacer: { height: 10 },
    loader: { marginVertical: 12 },
    answerText: { fontSize: 14, color: theme.colors.text, lineHeight: 21 },
    sourcesText: { fontSize: 11, color: theme.colors.primary, marginTop: 10 },
  });
