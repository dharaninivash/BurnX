// Polyfill global process for browser compatibility before any module loads
if (typeof window !== 'undefined') {
  if (typeof window.process === 'undefined') {
    window.process = { env: {} };
  } else if (!window.process.env) {
    window.process.env = {};
  }
}
if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.process === 'undefined') {
    globalThis.process = { env: {} };
  } else if (!globalThis.process.env) {
    globalThis.process.env = {};
  }
}

import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import App from './App';

registerRootComponent(App);

// Fail-safe Web Root Tag Mounting
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const mountAppOnWeb = () => {
    let rootTag = document.getElementById('root') || document.getElementById('main') || document.getElementById('app');
    if (!rootTag) {
      rootTag = document.createElement('div');
      rootTag.id = 'root';
      document.body.appendChild(rootTag);
    }
    try {
      AppRegistry.runApplication('main', { rootTag });
    } catch (err) {
      console.warn('BurnX Web Mount Notice:', err?.message);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAppOnWeb);
  } else {
    mountAppOnWeb();
  }
}
