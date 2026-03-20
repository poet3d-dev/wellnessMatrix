/**
 * Wellness Matrix push notification utilities.
 * Handles scheduling daily reminders for morning and evening journals.
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { SchedulableTriggerInputTypes } from "expo-notifications";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request user permission for push notifications.
 * Required before scheduling any notifications.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") {
    console.log("Notifications not supported on web");
    return false;
  }

  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Failed to request notification permissions:", error);
    return false;
  }
}

/**
 * Schedule a daily morning reminder at 7:00 AM.
 * Triggers a notification prompting the user to complete their morning journal.
 */
export async function scheduleMorningReminder(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "☀️ Good Morning!",
        body: "Time for your morning journal. How are you feeling today?",
        data: { type: "morning_journal" },
        sound: "default",
        badge: 1,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 7, // 7 hours from now
        repeats: true,
      },
    });
    console.log("Morning reminder scheduled:", notificationId);
    return notificationId;
  } catch (error) {
    console.error("Failed to schedule morning reminder:", error);
    return null;
  }
}

/**
 * Schedule a daily evening reminder at 7:00 PM.
 * Triggers a notification prompting the user to complete their evening journal.
 */
export async function scheduleEveningReminder(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌙 Evening Reflection",
        body: "Time to reflect on your day. What was your best moment?",
        data: { type: "evening_journal" },
        sound: "default",
        badge: 1,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 19, // 19 hours from now
        repeats: true,
      },
    });
    console.log("Evening reminder scheduled:", notificationId);
    return notificationId;
  } catch (error) {
    console.error("Failed to schedule evening reminder:", error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications.
 * Useful when user disables reminders or logs out.
 */
export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("All reminders cancelled");
  } catch (error) {
    console.error("Failed to cancel reminders:", error);
  }
}

/**
 * Get all scheduled notifications.
 * Useful for debugging or checking reminder status.
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  if (Platform.OS === "web") return [];

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Failed to get scheduled notifications:", error);
    return [];
  }
}

/**
 * Set up notification listeners for when notifications are received or tapped.
 * Call this once in the app root layout.
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
): () => void {
  if (Platform.OS === "web") return () => {};

  // Listen for notifications when app is in foreground
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification received:", notification);
      onNotificationReceived?.(notification);
    }
  );

  // Listen for notification taps
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log("Notification tapped:", response);
      onNotificationTapped?.(response);
    }
  );

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
