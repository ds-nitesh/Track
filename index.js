/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Optional FCM background handler — active when @react-native-firebase/messaging is installed
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    console.log('[Track] Background FCM message', remoteMessage?.messageId);
  });
} catch {
  // Native FCM not installed yet
}

AppRegistry.registerComponent(appName, () => App);
