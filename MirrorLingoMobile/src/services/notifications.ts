import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export interface SpacedRepetitionSchedule {
  phraseId: string;
  phrase: string;
  nextReview: Date;
  interval: number; // days
  easeFactor: number;
  repetitions: number;
}

class NotificationService {
  constructor() {
    this.configure();
  }

  configure() {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
      },
      onNotification: (notification) => {
        console.log('Notification received:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channel for Android
    PushNotification.createChannel(
      {
        channelId: 'spaced-repetition',
        channelName: 'Spaced Repetition',
        channelDescription: 'Reminders for Spanish practice',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  scheduleSpacedRepetition(schedule: SpacedRepetitionSchedule) {
    // Hash string ID to numeric for notification system
    const notificationId = Math.abs(schedule.phraseId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)) % 2147483647;
    
    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'spaced-repetition',
      title: '🇪🇸 Time to Practice Spanish!',
      message: `Review: "${schedule.phrase.substring(0, 50)}${schedule.phrase.length > 50 ? '...' : ''}"`,
      date: schedule.nextReview,
      allowWhileIdle: true,
      repeatType: undefined, // We'll handle scheduling manually
      userInfo: {
        phraseId: schedule.phraseId,
        type: 'spaced-repetition',
      },
    });

    console.log(`Scheduled notification for phrase: ${schedule.phrase} at ${schedule.nextReview}`);
  }

  cancelNotification(phraseId: string) {
    const notificationId = Math.abs(phraseId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)) % 2147483647;
    PushNotification.cancelLocalNotification(notificationId);
  }

  scheduleDaily(hour: number = 19, minute: number = 0) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    PushNotification.localNotificationSchedule({
      id: 999, // Fixed ID for daily reminder
      channelId: 'spaced-repetition',
      title: '🎯 Daily Spanish Practice',
      message: 'Keep your learning streak alive! Practice your personalized phrases.',
      date: scheduledTime,
      repeatType: 'day',
      allowWhileIdle: true,
      userInfo: {
        type: 'daily-reminder',
      },
    });

    console.log(`Daily reminder scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
  }

  cancelDailyReminder() {
    PushNotification.cancelLocalNotification(999);
  }

  requestPermissions() {
    PushNotification.requestPermissions();
  }

  checkPermissions() {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions);
      });
    });
  }
}

export const notificationService = new NotificationService();
