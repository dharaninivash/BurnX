import React, { useEffect } from 'react';
import { View, Platform, StyleSheet } from 'react-native';

export default function LenisSmoothScroll({ children, style }) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Inject global web scroll fix to ensure html, body, root and all scroll containers
    // can ALWAYS scroll smoothly with mouse wheel, touchpad, keyboard (PageUp/Down, Arrows, Space) and scrollbar dragging
    try {
      const styleId = 'burnx-global-scroll-fix';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `
        html, body {
          margin: 0;
          padding: 0;
          height: auto !important;
          min-height: 100vh;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          -webkit-overflow-scrolling: touch !important;
          scroll-behavior: smooth !important;
        }
        #root, #root > div {
          height: auto !important;
          min-height: 100vh;
          overflow-y: visible !important;
        }
        /* Ensure React Native Web ScrollViews can scroll naturally without event interception */
        div[style*="overflow"] {
          -webkit-overflow-scrolling: touch !important;
          scroll-behavior: smooth !important;
        }
        * {
          box-sizing: border-box;
        }
      `;
    } catch (_) {}

    // Ensure window event listeners never prevent default wheel or keydown scrolling
    const allowScrollWheel = (e) => {
      // Do not stop propagation or prevent default for wheel
      e.stopPropagation();
    };

    window.addEventListener('wheel', allowScrollWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', allowScrollWheel);
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  }
});
