import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import {
  requestNotificationPermissions,
  scheduleMorningReminder,
  scheduleEveningReminder,
  setupNotificationListeners,
  getScheduledNotifications,
} from "@/lib/notifications";
import { Platform } from "react-native";

/**
 * Hook to initialize push notifications and set up reminders.
 * Call this once in the app root layout.
 */
export function useNotifications() {
  const router = useRouter();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const initializeNotifications = async () => {
      try {
        // Request permission
        const granted = await requestNotificationPermissions();
        if (!granted) {
          console.log("Notification permissions not granted");
          return;
        }

        // Check if reminders are already scheduled
        const scheduled = await getScheduledNotifications();
        if (scheduled.length === 0) {
          // Schedule reminders
          await scheduleMorningReminder();
          await scheduleEveningReminder();
        }

        // Set up listeners for notification interactions
        cleanupRef.current = setupNotificationListeners(
          (notification) => {
            // Handle notification received
            console.log("Notification received:", notification);
          },
          (response) => {
            // Handle notification tapped
            const notificationType = response.notification.request.content.data?.type;
            if (notificationType === "morning_journal") {
              router.push("/journal/morning");
            } else if (notificationType === "evening_journal") {
              router.push("/journal/evening");
            }
          }
        );
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      cleanupRef.current?.();
    };
  }, [router]);
}
