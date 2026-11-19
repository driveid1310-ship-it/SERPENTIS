import React from 'react';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import PlacesScreen from '../screens/PlacesScreen';
import SosScreen from '../screens/SosScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HeritageScreen from '../screens/HeritageScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import PasswordResetSuccessScreen from '../screens/PasswordResetSuccessScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import MapScreen from '../screens/MapScreen';
import ReportDetailsScreen from '../screens/ReportDetailsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ContributionHistoryScreen from '../screens/ContributionHistoryScreen';
import BadgesScreen from '../screens/BadgesScreen';
import ThemeScreen from '../screens/ThemeScreen';
import DesignShowcaseScreen from '../screens/DesignShowcaseScreen';
import WeatherScreen from '../screens/WeatherScreen';
import AirQualityScreen from '../screens/AirQualityScreen';
import EnvironmentalMonitoringScreen from '../screens/EnvironmentalMonitoringScreen';
import EnvironmentalAlertsScreen from '../screens/EnvironmentalAlertsScreen';
import EnvironmentalAnalyticsScreen from '../screens/EnvironmentalAnalyticsScreen';
import CityAssistantScreen from '../screens/CityAssistantScreen';
import CityIntelligenceScreen from '../screens/CityIntelligenceScreen';
import CitySelectorScreen from '../screens/CitySelectorScreen';

import { useTheme } from '../context/ThemeContext';
import { Text, Platform } from 'react-native';

export type MainTabParamList = {
  HomeTab: undefined;
  Map: {
    targetPlace?: {
      id: string;
      name: string;
      category: string;
      coordinates: [number, number];
      address?: string;
    };
  } | undefined;
  ReportIssue: undefined;
  Community: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Home: NavigatorScreenParams<MainTabParamList> | undefined;
  HomeTab: undefined;
  ReportIssue: undefined;
  Places: undefined;
  SOS: undefined;
  Notifications: undefined;
  Heritage: undefined;
  Profile: undefined;
  ForgotPassword: undefined;

  OtpVerification: {
    email: string;
  };

  ResetPassword: {
    resetToken: string;
  };

  PasswordResetSuccess: undefined;
  EditProfile: undefined;
  PrivacySecurity: undefined;
  HelpSupport: undefined;
  ReportDetails: { reportId: string };
  Community: undefined;
  CreateGroup: undefined;
  GroupDetails: { groupId: string };
  GroupChat: { groupId: string; groupName: string };
  Leaderboard: undefined;
  Dashboard: undefined;
  ContributionHistory: undefined;
  Badges: undefined;
  Theme: undefined;
  DesignShowcase: undefined;
  Weather: undefined;
  AirQuality: undefined;
  EnvironmentalMonitoring: undefined;
  EnvironmentalAlerts: undefined;
  EnvironmentalAnalytics: undefined;
  CityAssistant: undefined;
  CityIntelligence: undefined;
  CitySelector: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const renderHomeIcon = ({ color }: { color: string }) => (
  <Text style={[tabIconStyles.icon, { color }]}>⌂</Text>
);
const renderMapIcon = ({ color }: { color: string }) => (
  <Text style={[tabIconStyles.icon, { color }]}>📍</Text>
);
const renderReportIcon = ({ color }: { color: string }) => (
  <Text style={[tabIconStyles.plusIcon, { color }]}>+</Text>
);
const renderCommunityIcon = ({ color }: { color: string }) => (
  <Text style={[tabIconStyles.icon, { color }]}>👥</Text>
);
const renderProfileIcon = ({ color }: { color: string }) => (
  <Text style={[tabIconStyles.icon, { color }]}>👤</Text>
);

const tabIconStyles = {
  icon: { fontSize: 18 },
  plusIcon: { fontSize: 24, fontWeight: 'bold' as const, marginBottom: -2 },
};

function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#0a0a0a', // near-black
          borderTopColor: '#222222',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 4,
        }
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen as any}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen as any}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: renderMapIcon,
        }}
      />
      <Tab.Screen
        name="ReportIssue"
        component={ReportIssueScreen as any}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: renderReportIcon,
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen as any}
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: renderCommunityIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen as any}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ContributionHistory" component={ContributionHistoryScreen} />
      <Stack.Screen name="Badges" component={BadgesScreen} />
      <Stack.Screen name="Theme" component={ThemeScreen} />
      <Stack.Screen name="DesignShowcase" component={DesignShowcaseScreen} />
      <Stack.Screen name="Weather" component={WeatherScreen} />
      <Stack.Screen name="AirQuality" component={AirQualityScreen} />
      <Stack.Screen name="EnvironmentalMonitoring" component={EnvironmentalMonitoringScreen} />
      <Stack.Screen name="EnvironmentalAlerts" component={EnvironmentalAlertsScreen} />
      <Stack.Screen name="EnvironmentalAnalytics" component={EnvironmentalAnalyticsScreen} />
      <Stack.Screen name="CityAssistant" component={CityAssistantScreen} />
      <Stack.Screen name="CityIntelligence" component={CityIntelligenceScreen} />
      <Stack.Screen name="CitySelector" component={CitySelectorScreen} />
      
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      
      {/* Home is now the Tab Navigator */}
      <Stack.Screen name="Home" component={MainTabs} />
      
      <Stack.Screen name="Places" component={PlacesScreen} />
      <Stack.Screen name="SOS" component={SosScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Heritage" component={HeritageScreen} />
      
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="PasswordResetSuccess" component={PasswordResetSuccessScreen} />
    </Stack.Navigator>
  );
}
