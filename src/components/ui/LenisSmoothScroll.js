import React, { useEffect } from 'react';
import { View, Platform, StyleSheet } from 'react-native';

export default function LenisSmoothScroll({ children, style }) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Inject global web scroll fix to ensure body and containers are ALWAYS scrollable
    try {
      const styleId = 'burnx-global-scroll-fix';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
          html, body, #root, #root > div {
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scroll-behavior: smooth !important;
          }
          * {
            box-sizing: border-box;
          }
        `;
        document.head.appendChild(styleEl);
      }
    } catch (_) {}

    let lenis;
    let animFrameId;

    try {
      const Lenis = require('lenis').default || require('lenis');
      
      lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false,
      });

      function raf(time) {
        lenis.raf(time);
        animFrameId = requestAnimationFrame(raf);
      }

      animFrameId = requestAnimationFrame(raf);
    } catch (e) {
      // Native smooth scroll fallback
    }

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (lenis) {
        try { lenis.destroy(); } catch (_) {}
      }
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
