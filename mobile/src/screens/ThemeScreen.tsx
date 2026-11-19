import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { themes, ThemeName } from '../theme/themes';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Theme'>;

export default function ThemeScreen({ navigation }: Props) {

  const { theme, themeName, setThemeName } = useTheme();

  const handleThemeSelect = (name: ThemeName) => {
    setThemeName(name);
  };

  return (
    <Screen scrollable>
      <Header title="Appearance" onBackPress={() => navigation.goBack()} />
      <View style={{ padding: theme.spacing.md, gap: theme.spacing.lg }}>
        <Text style={{ fontSize: theme.typography.h3, fontWeight: 'bold', color: theme.colors.text }}>
          Select Theme
        </Text>
        
        <View style={{ gap: theme.spacing.md }}>
          {(Object.entries(themes) as [ThemeName, typeof theme][]).map(([key, t]) => {
            const isSelected = key === themeName;
            
            return (
              <Pressable
                key={key}
                onPress={() => handleThemeSelect(key)}
                style={{
                  backgroundColor: t.colors.surface,
                  borderRadius: t.radius.lg,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? t.colors.primary : t.colors.border,
                  padding: t.spacing.md,
                  ...t.shadows.sm,
                  overflow: 'hidden',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.sm }}>
                  <Text style={{ fontSize: t.typography.h3, fontWeight: 'bold', color: t.colors.text }}>
                    {t.name.toUpperCase()}
                  </Text>
                  {isSelected && (
                    <View style={{ backgroundColor: t.colors.primarySoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                      <Text style={{ color: t.colors.primary, fontSize: 10, fontWeight: 'bold' }}>SELECTED</Text>
                    </View>
                  )}
                </View>
                
                <View style={{ height: 60, backgroundColor: t.colors.background, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, flexDirection: 'row', alignItems: 'center', padding: t.spacing.sm, gap: t.spacing.sm }}>
                   <View style={{ width: 30, height: 30, borderRadius: t.radius.round, backgroundColor: t.colors.primary }} />
                   <View style={{ flex: 1, gap: 4 }}>
                     <View style={{ height: 8, width: '60%', backgroundColor: t.colors.text, borderRadius: 4 }} />
                     <View style={{ height: 6, width: '40%', backgroundColor: t.colors.textSecondary, borderRadius: 3 }} />
                   </View>
                </View>

                <Text style={{ fontSize: t.typography.body, color: t.colors.textSecondary, marginTop: t.spacing.md }}>
                  {t.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
