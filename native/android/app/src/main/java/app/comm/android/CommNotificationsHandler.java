package app.comm.android;

import android.app.NotificationManager;
import android.content.Context;
import android.service.notification.StatusBarNotification;
import com.google.firebase.messaging.RemoteMessage;
import io.invertase.firebase.messaging.RNFirebaseMessagingService;

/**
 * We're extending RNFirebaseMessagingService here instead of
 * FirebaseMessagingService which is not ideal but let's us work around an
 * Android limitation. If there are a couple of FirebaseMessagingServices
 * declared in manifest, only the first one would get all the notifications.
 * So we need to find a way to have only one service that implements this.
 *
 * There are a couple of solutions here:
 * 1. We could have both services declared and only one of them would handle
 * the intents. Then it would check the intent and forward it to
 * another service. This solution is problematic as the second service would
 * need to listen for a different set of intents that effectively duplicate
 * all the notifications intents.
 * 2. We can instantiate RNFirebaseMessagingService here and call its callbacks
 * which sounds like a good solution. But then, some mechanisms would not work
 * correctly, e.g. we would need to somehow take care of the Context.
 * 3. This solution, in which we extend RNFirebaseMessagingService, would
 * consist of implementing the callbacks and either handling them or calling
 * super methods. In near future we plan to get rid of
 * RNFirebaseMessagingService and at that point super methods will no longer be
 * called and this class could start implementing FirebaseMessagingService.
 *
 * There's nothing that makes 1st and 2nd solution impossible, but 3rd one is
 * the easiest in terms of making it safe.
 */
public class CommNotificationsHandler extends RNFirebaseMessagingService {
  private static final String RESCIND_KEY = "rescind";
  private static final String RESCIND_ID_KEY = "rescindID";
  private NotificationManager notificationManager;

  @Override
  public void onCreate() {
    super.onCreate();
    notificationManager = (NotificationManager)this.getSystemService(
        Context.NOTIFICATION_SERVICE);
  }

  @Override
  public void onMessageReceived(RemoteMessage message) {
    String rescind = message.getData().get(RESCIND_KEY);
    String rescindID = message.getData().get(RESCIND_ID_KEY);
    if ("true".equals(rescind) &&
        android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
      for (StatusBarNotification notification :
           notificationManager.getActiveNotifications()) {
        if (notification.getTag().equals(rescindID)) {
          notificationManager.cancel(
              notification.getTag(), notification.getId());
        }
      }

      // It should never happen, but just in case, when a message contains both
      // data and notification, we still would like to forward it to
      // RNNotifications. So if getNotification returns non-null, we don't
      // return and instead execute super.onMessageReceived(message)
      if (message.getNotification() == null) {
        return;
      }
    }

    super.onMessageReceived(message);
  }
}