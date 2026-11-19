import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';

type ThemeMode = 'light' | 'dark';
type DesignDirection = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I';

type Tokens = {
  colors: {
    background: string; surface: string; surfaceElevated: string;
    text: string; textSecondary: string; textTertiary: string;
    primary: string; primaryDark: string; primarySoft: string;
    border: string; success: string; warning: string; error: string; sos: string; overlay: string;
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  radius: { sm: number; md: number; lg: number; xl: number; round: number };
  typography: { fontFamily: string; h1: number; h2: number; h3: number; body: number; caption: number };
  shadows: any;
  graphics: { useGradients: boolean; useMapPatterns: boolean; useGlow: boolean; organicShapes: boolean; };
};

const getTokens = (design: DesignDirection, mode: ThemeMode): Tokens => {
  const isDark = mode === 'dark';
  
  if (design === 'A') return {
    colors: { background: isDark ? '#121212' : '#F8F9FA', surface: isDark ? '#1E1E1E' : '#FFFFFF', surfaceElevated: isDark ? '#2C2C2C' : '#FFFFFF', text: isDark ? '#F8F9FA' : '#212529', textSecondary: isDark ? '#9E9E9E' : '#6C757D', textTertiary: isDark ? '#757575' : '#ADB5BD', primary: isDark ? '#00C853' : '#0B3B24', primaryDark: isDark ? '#009624' : '#072617', primarySoft: isDark ? 'rgba(0,200,83,0.15)' : '#E8F5E9', border: isDark ? '#2C2C2C' : '#DEE2E6', success: isDark ? '#00E676' : '#28A745', warning: isDark ? '#FFCA28' : '#FFC107', error: isDark ? '#FF5252' : '#DC3545', sos: isDark ? '#FF1744' : '#C92A2A', overlay: 'rgba(0,0,0,0.5)' },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }, radius: { sm: 4, md: 8, lg: 12, xl: 16, round: 999 }, typography: { fontFamily: 'System', h1: 28, h2: 22, h3: 18, body: 16, caption: 12 }, shadows: isDark ? {} : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }, graphics: { useGradients: false, useMapPatterns: false, useGlow: false, organicShapes: false }
  };
  if (design === 'B') return {
    colors: { background: isDark ? '#0A0A0A' : '#EAEAEA', surface: isDark ? '#141414' : '#FFFFFF', surfaceElevated: isDark ? '#1F1F1F' : '#FAFAFA', text: isDark ? '#FFFFFF' : '#000000', textSecondary: isDark ? '#A0A0A0' : '#505050', textTertiary: isDark ? '#666666' : '#888888', primary: '#00E676', primaryDark: '#00C853', primarySoft: isDark ? 'rgba(0, 230, 118, 0.1)' : 'rgba(0, 230, 118, 0.2)', border: isDark ? '#333333' : '#D0D0D0', success: '#00E676', warning: '#FFD54F', error: '#FF5252', sos: '#FF1744', overlay: 'rgba(0,0,0,0.8)' },
    spacing: { xs: 2, sm: 6, md: 12, lg: 20, xl: 28 }, radius: { sm: 2, md: 4, lg: 6, xl: 8, round: 999 }, typography: { fontFamily: 'System', h1: 24, h2: 20, h3: 16, body: 14, caption: 11 }, shadows: isDark ? { shadowColor: '#00E676', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 8 } : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }, graphics: { useGradients: false, useMapPatterns: false, useGlow: true, organicShapes: false }
  };
  if (design === 'C') return {
    colors: { background: isDark ? '#000000' : '#FFFFFF', surface: isDark ? '#111111' : '#FFFFFF', surfaceElevated: isDark ? '#222222' : '#F9F9F9', text: isDark ? '#FFFFFF' : '#111111', textSecondary: isDark ? '#888888' : '#777777', textTertiary: isDark ? '#555555' : '#AAAAAA', primary: isDark ? '#FFFFFF' : '#000000', primaryDark: isDark ? '#CCCCCC' : '#333333', primarySoft: isDark ? '#222222' : '#F4F4F4', border: isDark ? '#333333' : '#EEEEEE', success: isDark ? '#34C759' : '#34C759', warning: isDark ? '#FFCC00' : '#FFCC00', error: isDark ? '#FF3B30' : '#FF3B30', sos: isDark ? '#FF3B30' : '#FF3B30', overlay: 'rgba(0,0,0,0.3)' },
    spacing: { xs: 8, sm: 16, md: 24, lg: 32, xl: 48 }, radius: { sm: 0, md: 0, lg: 0, xl: 0, round: 999 }, typography: { fontFamily: 'System', h1: 32, h2: 24, h3: 20, body: 16, caption: 12 }, shadows: {}, graphics: { useGradients: false, useMapPatterns: false, useGlow: false, organicShapes: false }
  };
  if (design === 'D') return {
    colors: { background: isDark ? '#181A1F' : '#F4F7F6', surface: isDark ? '#20232A' : '#FFFFFF', surfaceElevated: isDark ? '#282C34' : '#FFFFFF', text: isDark ? '#E5E6E9' : '#2D3142', textSecondary: isDark ? '#9A9EA6' : '#79808E', textTertiary: isDark ? '#6B707B' : '#B0B5C1', primary: '#0F7A61', primaryDark: '#0A5241', primarySoft: isDark ? '#153A33' : '#E6F3F0', border: isDark ? '#363A45' : '#E8EAED', success: '#20A865', warning: '#F2A900', error: '#D94C4C', sos: '#C92A2A', overlay: 'rgba(24, 26, 31, 0.6)' },
    spacing: { xs: 4, sm: 8, md: 16, lg: 20, xl: 28 }, radius: { sm: 8, md: 16, lg: 24, xl: 32, round: 999 }, typography: { fontFamily: 'System', h1: 26, h2: 22, h3: 18, body: 16, caption: 14 }, shadows: isDark ? {} : { shadowColor: '#0F7A61', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 6 }, graphics: { useGradients: false, useMapPatterns: false, useGlow: false, organicShapes: false }
  };
  
  // NEW DESIGNS E, F, G, H, I
  if (design === 'E') return {
    colors: { background: isDark ? '#05140F' : '#E8F5E9', surface: isDark ? 'rgba(20, 45, 35, 0.6)' : 'rgba(255, 255, 255, 0.7)', surfaceElevated: isDark ? 'rgba(30, 60, 45, 0.8)' : 'rgba(255, 255, 255, 0.9)', text: isDark ? '#FFFFFF' : '#0B3B24', textSecondary: isDark ? '#A3D9B9' : '#1A633F', textTertiary: isDark ? '#689F82' : '#4CAF50', primary: '#00E676', primaryDark: '#00C853', primarySoft: isDark ? 'rgba(0, 230, 118, 0.15)' : 'rgba(0, 200, 83, 0.15)', border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(11, 59, 36, 0.1)', success: '#00E676', warning: '#FFCA28', error: '#FF5252', sos: '#FF1744', overlay: 'rgba(5, 20, 15, 0.6)' },
    spacing: { xs: 6, sm: 12, md: 18, lg: 24, xl: 36 }, radius: { sm: 8, md: 16, lg: 24, xl: 32, round: 999 }, typography: { fontFamily: 'System', h1: 34, h2: 26, h3: 20, body: 16, caption: 13 }, shadows: { shadowColor: '#00E676', shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.2 : 0.1, shadowRadius: 16, elevation: 4 }, graphics: { useGradients: true, useMapPatterns: false, useGlow: false, organicShapes: false }
  };
  if (design === 'F') return {
    colors: { background: isDark ? '#111111' : '#FDFDFD', surface: isDark ? '#1A1A1A' : '#FFFFFF', surfaceElevated: isDark ? '#222222' : '#FFFFFF', text: isDark ? '#FDFDFD' : '#111111', textSecondary: isDark ? '#AAAAAA' : '#555555', textTertiary: isDark ? '#777777' : '#999999', primary: isDark ? '#00C853' : '#0B3B24', primaryDark: isDark ? '#00E676' : '#051A10', primarySoft: isDark ? '#223322' : '#F0F5F2', border: isDark ? '#333333' : '#E5E5E5', success: '#28A745', warning: '#FFC107', error: '#DC3545', sos: '#C92A2A', overlay: 'rgba(0,0,0,0.5)' },
    spacing: { xs: 4, sm: 8, md: 24, lg: 40, xl: 56 }, radius: { sm: 2, md: 4, lg: 8, xl: 12, round: 999 }, typography: { fontFamily: 'System', h1: 42, h2: 32, h3: 22, body: 18, caption: 12 }, shadows: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }, graphics: { useGradients: false, useMapPatterns: false, useGlow: false, organicShapes: false }
  };
  if (design === 'G') return {
    colors: { background: isDark ? '#090B0F' : '#121620', surface: isDark ? '#11151C' : '#1C2230', surfaceElevated: isDark ? '#1A202C' : '#273043', text: '#FFFFFF', textSecondary: '#8A9DBA', textTertiary: '#4E6280', primary: '#00F0FF', primaryDark: '#00B8D9', primarySoft: 'rgba(0, 240, 255, 0.1)', border: 'rgba(0, 240, 255, 0.2)', success: '#00E676', warning: '#FFCA28', error: '#FF3366', sos: '#FF0055', overlay: 'rgba(9, 11, 15, 0.8)' },
    spacing: { xs: 4, sm: 10, md: 16, lg: 24, xl: 32 }, radius: { sm: 4, md: 8, lg: 12, xl: 16, round: 999 }, typography: { fontFamily: 'System', h1: 28, h2: 20, h3: 16, body: 14, caption: 11 }, shadows: { shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 }, graphics: { useGradients: false, useMapPatterns: true, useGlow: true, organicShapes: false }
  };
  if (design === 'H') return {
    colors: { background: isDark ? '#2A2E2A' : '#F9F7F1', surface: isDark ? '#363A36' : '#FFFFFF', surfaceElevated: isDark ? '#424842' : '#FFFFFF', text: isDark ? '#F0EBE1' : '#333D33', textSecondary: isDark ? '#B3B8B3' : '#6B756B', textTertiary: isDark ? '#808780' : '#A3ABA3', primary: isDark ? '#81C784' : '#4CAF50', primaryDark: isDark ? '#66BB6A' : '#388E3C', primarySoft: isDark ? 'rgba(129, 199, 132, 0.15)' : '#E8F5E9', border: isDark ? '#4A524A' : '#E0DCD3', success: '#81C784', warning: '#FFD54F', error: '#E57373', sos: '#EF5350', overlay: 'rgba(42, 46, 42, 0.5)' },
    spacing: { xs: 8, sm: 14, md: 20, lg: 30, xl: 44 }, radius: { sm: 12, md: 20, lg: 30, xl: 40, round: 999 }, typography: { fontFamily: 'System', h1: 30, h2: 24, h3: 18, body: 16, caption: 14 }, shadows: isDark ? {} : { shadowColor: '#333D33', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2 }, graphics: { useGradients: false, useMapPatterns: false, useGlow: false, organicShapes: true }
  };
  if (design === 'I') return {
    colors: { background: isDark ? '#191A1A' : '#F0F2F5', surface: isDark ? '#242526' : '#FFFFFF', surfaceElevated: isDark ? '#3A3B3C' : '#FFFFFF', text: isDark ? '#E4E6EB' : '#1C1E21', textSecondary: isDark ? '#B0B3B8' : '#606770', textTertiary: isDark ? '#8D949E' : '#8A9099', primary: isDark ? '#00A453' : '#008443', primaryDark: isDark ? '#008B46' : '#006B36', primarySoft: isDark ? 'rgba(0, 164, 83, 0.15)' : 'rgba(0, 132, 67, 0.1)', border: isDark ? '#3E4042' : '#DADDE1', success: '#31A24C', warning: '#F5C33B', error: '#E41E3F', sos: '#E41E3F', overlay: 'rgba(0,0,0,0.6)' },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }, radius: { sm: 6, md: 12, lg: 16, xl: 24, round: 999 }, typography: { fontFamily: 'System', h1: 26, h2: 20, h3: 16, body: 15, caption: 13 }, shadows: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.3 : 0.15, shadowRadius: 12, elevation: 6 }, graphics: { useGradients: false, useMapPatterns: true, useGlow: false, organicShapes: false }
  };
  
  return getTokens('A', mode);
};

// Graphics Components
const MapPatternBackground = ({ tokens }: { tokens: Tokens }) => {

  if (!tokens.graphics.useMapPatterns) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, overflow: 'hidden' }}>
      {[...Array(20)].map((_, i) => <View key={i} style={{ position: 'absolute', top: i * 40, left: -50, right: -50, height: 1, backgroundColor: tokens.colors.primary }} />)}
      {[...Array(10)].map((_, i) => <View key={i} style={{ position: 'absolute', left: i * 40, top: -50, bottom: -50, width: 1, backgroundColor: tokens.colors.primary }} />)}
    </View>
  );
};

const OrganicShapesBackground = ({ tokens }: { tokens: Tokens }) => {
  if (!tokens.graphics.organicShapes) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Animated.View style={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: tokens.colors.primarySoft, opacity: 0.6, transform: [{ scaleX: 1.2 }, { rotate: '45deg' }] }} />
      <Animated.View style={{ position: 'absolute', bottom: -100, left: -20, width: 300, height: 200, borderRadius: 100, backgroundColor: tokens.colors.surfaceElevated, opacity: 0.4, transform: [{ scaleY: 1.5 }, { rotate: '-20deg' }] }} />
    </View>
  );
};

const GlowBlobs = ({ tokens }: { tokens: Tokens }) => {
  if (!tokens.graphics.useGlow) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', opacity: 0.5 }}>
      <View style={{ position: 'absolute', top: '10%', left: '-20%', width: 200, height: 200, borderRadius: 100, backgroundColor: tokens.colors.primary, opacity: 0.4 }} />
      <View style={{ position: 'absolute', bottom: '10%', right: '-10%', width: 250, height: 250, borderRadius: 125, backgroundColor: tokens.colors.success, opacity: 0.2 }} />
    </View>
  );
};

const AnimatedTrustScore = ({ tokens }: { tokens: Tokens }) => {
  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withSpring(1, { damping: 15, stiffness: 80 }); }, [progress]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 85}%` }));

  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Text style={{ fontSize: tokens.typography.h3, color: tokens.colors.textSecondary, fontWeight: 'bold' }}>Trust Score</Text>
      <View style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.radius.xl, padding: tokens.spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: tokens.colors.border, position: 'relative', overflow: 'hidden', ...tokens.shadows }}>
        {tokens.graphics.useGradients && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tokens.colors.primarySoft, opacity: 0.3 }} />}
        <Text style={{ color: tokens.colors.textSecondary, fontSize: tokens.typography.caption, letterSpacing: 1 }}>TRUST REPUTATION</Text>
        <Animated.View entering={ZoomIn.duration(600)} style={{ flexDirection: 'row', alignItems: 'baseline', marginVertical: tokens.spacing.md }}>
          <Text style={{ color: tokens.colors.text, fontSize: 56, fontWeight: '900', textShadowColor: tokens.graphics.useGlow ? tokens.colors.primary : 'transparent', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>85</Text>
          <Text style={{ color: tokens.colors.textTertiary, fontSize: tokens.typography.h3 }}>/100</Text>
        </Animated.View>
        <View style={{ height: 8, width: '100%', backgroundColor: tokens.colors.border, borderRadius: tokens.radius.round, overflow: 'hidden' }}>
          <Animated.View style={[{ height: '100%', backgroundColor: tokens.colors.primary, borderRadius: tokens.radius.round }, progressStyle]} />
        </View>
      </View>
    </View>
  );
};

const AnimatedPressableCard = ({ children, tokens, delay = 0 }: any) => {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500).springify()}>
      <Pressable style={({ pressed }) => [{ backgroundColor: tokens.colors.surface, borderRadius: tokens.radius.lg, padding: tokens.spacing.md, borderWidth: 1, borderColor: tokens.colors.border, opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }], ...tokens.shadows }]}>
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default function DesignShowcaseScreen() {
  const [activeDesign, setActiveDesign] = useState<DesignDirection>('E');
  const [activeMode, setActiveMode] = useState<ThemeMode>('dark');
  const [key, setKey] = useState(0);
  
  useEffect(() => { setKey(prev => prev + 1); }, [activeDesign, activeMode]);
  const tokens = getTokens(activeDesign, activeMode);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.colors.background }}>
      <MapPatternBackground tokens={tokens} />
      <OrganicShapesBackground tokens={tokens} />
      <GlowBlobs tokens={tokens} />
      
      <View style={{ flexDirection: 'row', padding: 10, backgroundColor: tokens.colors.surfaceElevated, borderBottomWidth: 1, borderColor: tokens.colors.border, alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
          {(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as DesignDirection[]).map(d => (
            <Pressable key={d} onPress={() => setActiveDesign(d)} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: activeDesign === d ? tokens.colors.primary : tokens.colors.surface, borderRadius: tokens.radius.round, borderWidth: 1, borderColor: activeDesign === d ? tokens.colors.primary : tokens.colors.border, ...tokens.shadows }}>
              <Text style={{ color: activeDesign === d ? tokens.colors.background : tokens.colors.text, fontWeight: 'bold', fontSize: 12 }}>{d}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable onPress={() => setActiveMode(activeMode === 'light' ? 'dark' : 'light')} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: tokens.colors.surface, borderRadius: tokens.radius.round, borderWidth: 1, borderColor: tokens.colors.border, marginLeft: 8 }}>
          <Text style={{ color: tokens.colors.text, fontSize: 12 }}>{activeMode === 'light' ? '🌙' : '☀️'}</Text>
        </Pressable>
      </View>

      <ScrollView key={key} contentContainerStyle={{ padding: tokens.spacing.lg, gap: tokens.spacing.xl, paddingBottom: 100 }}>
        <Animated.View entering={FadeIn.duration(800)} style={{ marginVertical: tokens.spacing.md }}>
          <Text style={{ fontSize: tokens.typography.h1, fontWeight: '900', color: tokens.colors.text, letterSpacing: -0.5 }}>{activeDesign === 'F' ? 'YOUR CITY.' : activeDesign === 'I' ? 'Explore Local.' : 'Make Your City Better.'}</Text>
          <Text style={{ fontSize: tokens.typography.body, color: tokens.colors.textSecondary, marginTop: tokens.spacing.xs, lineHeight: 24 }}>Join 12,450 neighbors improving our community today.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: tokens.spacing.md, backgroundColor: tokens.colors.surface, borderRadius: tokens.radius.xl, borderWidth: 1, borderColor: tokens.colors.border, ...tokens.shadows }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm }}>
             <View style={{ width: 44, height: 44, borderRadius: tokens.radius.round, backgroundColor: tokens.colors.primaryDark, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: tokens.colors.primarySoft }}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>US</Text></View>
             <View><Text style={{ fontSize: tokens.typography.body, fontWeight: 'bold', color: tokens.colors.text }}>Jane Citizen</Text><Text style={{ fontSize: tokens.typography.caption, color: tokens.colors.primary }}>Ambassador Level</Text></View>
          </View>
          <View style={{ width: 44, height: 44, borderRadius: tokens.radius.round, backgroundColor: tokens.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 18 }}>🔔</Text><View style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.colors.error }} /></View>
        </Animated.View>

        <AnimatedTrustScore tokens={tokens} />

        <Animated.Text entering={FadeInUp.delay(200)} style={{ fontSize: tokens.typography.h2, color: tokens.colors.text, fontWeight: '800', marginTop: tokens.spacing.sm }}>{activeDesign === 'F' ? "WHAT'S HAPPENING" : 'Recent Reports'}</Animated.Text>

        <View style={{ gap: tokens.spacing.md }}>
          <AnimatedPressableCard tokens={tokens} delay={300}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: tokens.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: tokens.colors.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: tokens.radius.sm }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tokens.colors.primary }} /><Text style={{ color: tokens.colors.primary, fontSize: tokens.typography.caption, fontWeight: 'bold' }}>INFRASTRUCTURE</Text></View>
              <Text style={{ color: tokens.colors.warning, fontSize: tokens.typography.caption, fontWeight: 'bold' }}>IN PROGRESS</Text>
            </View>
            <Text style={{ fontSize: tokens.typography.h3, fontWeight: 'bold', color: tokens.colors.text, marginBottom: 4 }}>Pothole on Main St</Text>
            <Text style={{ fontSize: tokens.typography.body, color: tokens.colors.textSecondary, marginBottom: tokens.spacing.md, lineHeight: 22 }}>Large pothole near the intersection, causing traffic delays and vehicle damage.</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: tokens.colors.border, paddingTop: tokens.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={{ fontSize: 14 }}>📍</Text><Text style={{ color: tokens.colors.textTertiary, fontSize: tokens.typography.caption }}>123 Main St • 2h ago</Text></View>
              <View style={{ backgroundColor: tokens.colors.surfaceElevated, paddingHorizontal: 12, paddingVertical: 6, borderRadius: tokens.radius.round }}><Text style={{ color: tokens.colors.text, fontWeight: 'bold', fontSize: tokens.typography.caption }}>▲ 24 Votes</Text></View>
            </View>
          </AnimatedPressableCard>
          
          <AnimatedPressableCard tokens={tokens} delay={400}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: tokens.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: tokens.colors.surfaceElevated, paddingHorizontal: 10, paddingVertical: 4, borderRadius: tokens.radius.sm }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tokens.colors.textSecondary }} /><Text style={{ color: tokens.colors.textSecondary, fontSize: tokens.typography.caption, fontWeight: 'bold' }}>SANITATION</Text></View>
              <Text style={{ color: tokens.colors.success, fontSize: tokens.typography.caption, fontWeight: 'bold' }}>RESOLVED</Text>
            </View>
            <Text style={{ fontSize: tokens.typography.h3, fontWeight: 'bold', color: tokens.colors.text, marginBottom: 4 }}>Overflowing Bins</Text>
            <Text style={{ fontSize: tokens.typography.body, color: tokens.colors.textSecondary, marginBottom: tokens.spacing.md, lineHeight: 22 }}>Park bins haven't been emptied since the festival.</Text>
          </AnimatedPressableCard>
        </View>

        <Animated.View entering={FadeInUp.delay(500)} style={{ gap: tokens.spacing.md, marginTop: tokens.spacing.sm }}>
          <Text style={{ fontSize: tokens.typography.h2, color: tokens.colors.text, fontWeight: '800' }}>Local Groups</Text>
          <View style={{ backgroundColor: tokens.colors.primarySoft, borderRadius: tokens.radius.xl, padding: tokens.spacing.lg, borderWidth: 1, borderColor: tokens.colors.primary, ...tokens.shadows }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md }}>
              <View style={{ width: 60, height: 60, borderRadius: tokens.radius.round, backgroundColor: tokens.colors.primaryDark, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 28 }}>🌳</Text></View>
              <View style={{ flex: 1 }}><Text style={{ fontSize: tokens.typography.h3, fontWeight: 'bold', color: tokens.colors.text }}>Green City Initiative</Text><Text style={{ fontSize: tokens.typography.caption, color: tokens.colors.textSecondary, marginTop: 2 }}>Organizing weekend cleanups.</Text></View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing.lg }}>
              <View style={{ flexDirection: 'row' }}>
                {[1,2,3,4].map((i, idx) => <View key={i} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tokens.colors.surfaceElevated, borderWidth: 2, borderColor: tokens.colors.surface, marginLeft: idx === 0 ? 0 : -10, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 10 }}>👤</Text></View>)}
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tokens.colors.primary, borderWidth: 2, borderColor: tokens.colors.surface, marginLeft: -10, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>+1k</Text></View>
              </View>
              <Pressable style={{ backgroundColor: tokens.colors.primary, paddingHorizontal: tokens.spacing.lg, paddingVertical: tokens.spacing.sm, borderRadius: tokens.radius.round }}><Text style={{ color: tokens.colors.background, fontWeight: 'bold', fontSize: tokens.typography.body }}>Join Group</Text></Pressable>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)} style={{ gap: tokens.spacing.md }}>
          <Text style={{ fontSize: tokens.typography.h2, color: tokens.colors.text, fontWeight: '800' }}>Nearby</Text>
          <View style={{ height: 240, backgroundColor: tokens.colors.surfaceElevated, borderRadius: tokens.radius.xl, borderWidth: 1, borderColor: tokens.colors.border, position: 'relative', overflow: 'hidden', ...tokens.shadows }}>
            <View style={{ flex: 1, opacity: 0.15, padding: tokens.spacing.xl }}>
              {[...Array(6)].map((_, i) => <View key={i} style={{ width: '100%', height: 1, backgroundColor: tokens.colors.text, marginVertical: 15 }} />)}
              {[...Array(8)].map((_, i) => <View key={i} style={{ width: 1, height: '100%', backgroundColor: tokens.colors.text, position: 'absolute', left: 20 + i * 40 }} />)}
            </View>
            <View style={{ position: 'absolute', top: '35%', left: '45%', alignItems: 'center' }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tokens.colors.error, borderWidth: 4, borderColor: tokens.colors.surface, alignItems: 'center', justifyContent: 'center', ...tokens.shadows }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' }} /></View>
              <View style={{ width: 60, height: 20, backgroundColor: tokens.colors.error, opacity: 0.2, borderRadius: 30, transform: [{ scaleY: 0.3 }, { translateY: -10 }] }} />
            </View>
            <View style={{ position: 'absolute', bottom: tokens.spacing.md, left: tokens.spacing.md, right: tokens.spacing.md, backgroundColor: tokens.colors.surface, borderRadius: tokens.radius.lg, padding: tokens.spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: tokens.colors.border, ...tokens.shadows }}>
              <View style={{ width: 40, height: 40, borderRadius: tokens.radius.md, backgroundColor: 'rgba(228, 30, 63, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: tokens.spacing.md }}><Text style={{ fontSize: 18 }}>🚦</Text></View>
              <View style={{ flex: 1 }}><Text style={{ fontSize: tokens.typography.body, fontWeight: 'bold', color: tokens.colors.text }}>Broken Streetlight</Text><Text style={{ fontSize: tokens.typography.caption, color: tokens.colors.textSecondary }}>0.2 miles away</Text></View>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tokens.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: tokens.colors.primary, fontWeight: 'bold', fontSize: 18 }}>→</Text></View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700)} style={{ marginTop: tokens.spacing.lg }}>
          <Pressable style={{ backgroundColor: tokens.colors.sos, padding: tokens.spacing.xl, borderRadius: tokens.radius.xl, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: tokens.spacing.md, ...tokens.shadows }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 24 }}>🚨</Text></View>
            <View><Text style={{ color: '#FFF', fontSize: tokens.typography.h2, fontWeight: '900', letterSpacing: 1 }}>EMERGENCY SOS</Text><Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: tokens.typography.caption, marginTop: 2 }}>Hold to alert authorities instantly</Text></View>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
