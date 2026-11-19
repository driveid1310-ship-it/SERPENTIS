module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__tests__/mocks/reactNativeMock.js',
    '^react-native-reanimated$': '<rootDir>/__tests__/mocks/reanimatedMock.js',
    '^react-native-safe-area-context$': '<rootDir>/__tests__/mocks/safeAreaMock.js',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__tests__/mocks/fileMock.js',
  },
};
