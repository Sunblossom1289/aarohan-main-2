import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './index.css';
import './res.css';

// ==================== POLYFILLS ====================
// Safari (iOS) does not support requestIdleCallback / cancelIdleCallback
if (typeof window !== 'undefined') {
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = function (cb) {
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining: function () {
            return 0;
          },
        });
      }, 1);
    };
  }

  if (!window.cancelIdleCallback) {
    window.cancelIdleCallback = function (id) {
      clearTimeout(id);
    };
  }
}

// ==================== ASSET PRELOADER ====================
// Eagerly preload all BannerPage & LoginPage images into browser cache
const PRELOAD_IMAGES = [
  '/logo/logou.webp',
  '/wall/wal.webp',
  '/images/21.webp',
  '/images/22.webp',
  '/images/23.webp',
  '/images/24.webp',
  '/images/25.webp',
  '/images/26.webp',
  '/images/27.webp',
  '/images/28.webp',
];

// Preload via Image() objects - works even for dynamically loaded images
function preloadImages(urls) {
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

// Also prefetch the Unsplash images used in PerksSection
const PRELOAD_EXTERNAL = [
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1920',
];

// Start preloading immediately on script load
preloadImages(PRELOAD_IMAGES);

// Defer external images slightly to not block initial render
requestIdleCallback(() => preloadImages(PRELOAD_EXTERNAL));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </HelmetProvider>
  </StrictMode>,
);
