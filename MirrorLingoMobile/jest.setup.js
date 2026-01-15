jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-audio-recorder-player', () => ({
  default: jest.fn().mockImplementation(() => ({
    startRecorder: jest.fn(),
    stopRecorder: jest.fn(),
    addRecordBackListener: jest.fn(),
    removeRecordBackListener: jest.fn(),
  })),
}));

jest.mock('@react-native-voice/voice', () => ({
  default: {
    onSpeechStart: jest.fn(),
    onSpeechEnd: jest.fn(),
    onSpeechResults: jest.fn(),
    onSpeechError: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn().mockResolvedValue(undefined),
    removeAllListeners: jest.fn(),
  },
}));

jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  createChannel: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelLocalNotification: jest.fn(),
  requestPermissions: jest.fn(),
  checkPermissions: jest.fn(),
}));
