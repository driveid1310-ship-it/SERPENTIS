const React = require('react');

const createMockComponent = (name) => {
  const Comp = ({ children, ...props }) => React.createElement(name, props, children);
  Comp.displayName = name;
  return Comp;
};

module.exports = {
  Platform: { OS: 'android', Version: 35, select: (obj) => obj.android ?? obj.default },
  NativeModules: {
    SerpentisConfig: {
      API_BASE_URL: '',
      BUILD_TYPE: 'debug',
      IS_DEBUG: true,
    },
  },
  PermissionsAndroid: {
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: 'ACCESS_FINE_LOCATION',
      CAMERA: 'CAMERA',
      POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
    },
    RESULTS: { GRANTED: 'granted', DENIED: 'denied', NEVER_ASK_AGAIN: 'never_ask_again' },
    check: jest.fn(async () => true),
    request: jest.fn(async () => 'granted'),
  },
  StyleSheet: {
    create: (styles) => styles,
    flatten: (s) => s,
    absoluteFill: {},
  },
  View: createMockComponent('View'),
  Text: createMockComponent('Text'),
  TextInput: createMockComponent('TextInput'),
  Pressable: createMockComponent('Pressable'),
  ScrollView: createMockComponent('ScrollView'),
  FlatList: createMockComponent('FlatList'),
  ActivityIndicator: createMockComponent('ActivityIndicator'),
  Image: createMockComponent('Image'),
  Modal: createMockComponent('Modal'),
  KeyboardAvoidingView: createMockComponent('KeyboardAvoidingView'),
  SafeAreaView: createMockComponent('SafeAreaView'),
  Alert: { alert: jest.fn() },
  Linking: { openURL: jest.fn(async () => true) },
};
