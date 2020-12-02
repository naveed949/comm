// @flow

import invariant from 'invariant';
import { mergePrefixIntoBody } from 'lib/shared/notif-utils';
import type { RemoteMessage } from 'react-native-firebase';

import {
  recordAndroidNotificationActionType,
  rescindAndroidNotificationActionType,
} from '../redux/action-types';
import { store, dispatch } from '../redux/redux-setup';

import { getFirebase } from './firebase';
import { saveMessageInfos } from './utils';

const androidNotificationChannelID = 'default';
const vibrationSpec = [500, 500];

function handleAndroidMessage(
  message: RemoteMessage,
  updatesCurrentAsOf: number,
  handleIfActive?: (
    threadID: string,
    texts: {| body: string, title: ?string |},
  ) => boolean,
) {
  const firebase = getFirebase();
  const { data } = message;
  const { badge } = data;
  if (badge !== undefined && badge !== null) {
    firebase.notifications().setBadge(parseInt(badge, 10));
  }

  const { messageInfos } = data;
  if (messageInfos) {
    saveMessageInfos(messageInfos, updatesCurrentAsOf);
  }

  const { rescind, rescindID } = data;
  if (rescind) {
    invariant(rescindID, 'rescind message without notifID');
    firebase
      .notifications()
      .android.removeDeliveredNotificationsByTag(rescindID);
    dispatch({
      type: rescindAndroidNotificationActionType,
      payload: { notifID: rescindID, threadID: data.threadID },
    });
    return;
  }

  let { id, title, prefix, body, threadID, badgeOnly } = data;
  ({ body } = mergePrefixIntoBody({ body, title, prefix }));

  if (handleIfActive) {
    const texts = { title, body };
    const isActive = handleIfActive(threadID, texts);
    if (isActive) {
      return;
    }
  }

  if (badgeOnly === '1') {
    return;
  }

  const notification = new firebase.notifications.Notification()
    .setNotificationId(id)
    .setBody(body)
    .setData({ threadID })
    .android.setTag(id)
    .android.setChannelId(androidNotificationChannelID)
    .android.setDefaults([firebase.notifications.Android.Defaults.All])
    .android.setVibrate(vibrationSpec)
    .android.setAutoCancel(true)
    .android.setLargeIcon('@mipmap/ic_launcher')
    .android.setSmallIcon('@drawable/notif_icon');
  if (title) {
    notification.setTitle(title);
  }
  firebase.notifications().displayNotification(notification);

  // We keep track of what notifs have been rendered for a given thread so
  // that we can clear them immediately (without waiting for the rescind)
  // when the user navigates to that thread. Since we can't do this while
  // the app is closed, we rely on the rescind notif in that case.
  dispatch({
    type: recordAndroidNotificationActionType,
    payload: { threadID, notifID: id },
  });
}

async function androidBackgroundMessageTask(message: RemoteMessage) {
  const { updatesCurrentAsOf } = store.getState();
  handleAndroidMessage(message, updatesCurrentAsOf);
}

export {
  androidNotificationChannelID,
  handleAndroidMessage,
  androidBackgroundMessageTask,
};
