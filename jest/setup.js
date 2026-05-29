import 'react-native-gesture-handler/jestSetup';

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve({ authorizationStatus: 1 })),
    displayNotification: jest.fn(),
  },
  AndroidImportance: { HIGH: 4 },
}));
