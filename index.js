/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import './src/utils/applyGlobalFonts';
import { registerBackgroundHandler } from './src/services/notificationService';

// Must be outside any component — handles FCM when app is killed or backgrounded
registerBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
