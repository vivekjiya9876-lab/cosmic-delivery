// GloboCrust Main Application Module

import { 
  setLocation, 
  setCartOpen, 
  setTrackerOpen, 
  getState, 
  subscribe 
} from './state.js';

import { 
  LOCATIONS, 
  autoDetectLocation, 
  getLocationByCode 
} from './localization.js';

import { initMenu } from './menu.js';
import { initConfigurator } from './configurator.js';
import { initCart } from './cart.js';
import { initTracker } from './tracker.js';

// Setup Toast Notification
function showToast(message, type = 'add') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `px-5 py-3.5 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-3 text-sm font-semibold tracking-wide transition-all duration-300 transform translate-y-10 opacity-0 uppercase font-sans`;
  
  if (type === 'add') {
    toast.className += ' bg-[#121212]/95 border-emerald-500/30 text-emerald-400';
    toast.innerHTML = `<i class="fas fa-circle-check text-emerald-500"></i> <span>${message}</span>`;
  } else {
    toast.className += ' bg-[#121212]/95 border-[#FF3B30]/30 text-[#FF3B30]';
    toast.innerHTML = `<i class="fas fa-circle-exclamation text-[#FF3B30]"></i> <span>${message}</span>`;
  }

  container.appendChild(toast);

  // Trigger entrance transition
  setTimeout(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
  }, 50);

  // Remove toast after delay
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Initializing UI bindings
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Sub-modules
  initMenu('menu-grid');
  initConfigurator('configurator-workspace');
  initCart('cart-drawer', 'drawer-overlay', 'cart-drawer-content');
  initTracker('tracker-drawer', 'drawer-overlay', 'tracker-drawer-content');

  // 2. Populate Geo-Localization select dropdown in Hero
  const locSelect = document.getElementById('hero-location-select');
  if (locSelect) {
    locSelect.innerHTML = LOCATIONS.map(loc => 
      `<option value="${loc.code}">${loc.name} (${loc.currency})</option>`
    ).join('');

    locSelect.addEventListener('change', (e) => {
      const code = e.target.value;
      const selected = getLocationByCode(code);
      setLocation(selected);
    });
  }

  // 3. Set Default Location (London or NYC)
  const defaultLoc = LOCATIONS[0]; // NYC
  setLocation(defaultLoc);
  if (locSelect) {
    locSelect.value = defaultLoc.code;
  }

  // 4. Auto-Detect Geolocation Trigger
  const detectBtn = document.getElementById('hero-locate-btn');
  if (detectBtn) {
    detectBtn.addEventListener('click', async () => {
      // Set Loading Spinner
      const originalHTML = detectBtn.innerHTML;
      detectBtn.innerHTML = `<i class="fas fa-spinner animate-spin"></i> <span>Locating...</span>`;
      detectBtn.disabled = true;

      try {
        const detected = await autoDetectLocation();
        setLocation(detected);
        if (locSelect) {
          locSelect.value = detected.code;
        }
        showToast(`Located nearest kitchen: ${detected.shortName}`);
      } catch (err) {
        showToast('Detection failed. Please select manually.', 'remove');
      } finally {
        detectBtn.innerHTML = originalHTML;
        detectBtn.disabled = false;
      }
    });
  }

  // 5. Drawer Opening/Closing DOM bindings
  const cartBtn = document.getElementById('nav-cart-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const trackerBtn = document.getElementById('nav-tracker-btn');
  const trackerCloseBtn = document.getElementById('tracker-close-btn');
  const overlay = document.getElementById('drawer-overlay');

  if (cartBtn) {
    cartBtn.addEventListener('click', () => setCartOpen(true));
  }
  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => setCartOpen(false));
  }
  if (trackerBtn) {
    trackerBtn.addEventListener('click', () => {
      const { orderActive } = getState();
      if (orderActive) {
        setTrackerOpen(true);
      } else {
        showToast('No active deliveries to track', 'remove');
      }
    });
  }
  if (trackerCloseBtn) {
    trackerCloseBtn.addEventListener('click', () => setTrackerOpen(false));
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      setCartOpen(false);
      setTrackerOpen(false);
    });
  }

  // 6. Reactive UI updating for general headers/kitchen descriptions
  subscribe('locationChange', (location) => {
    const kitchenEl = document.getElementById('hero-kitchen-indicator');
    if (kitchenEl) {
      kitchenEl.innerHTML = `<i class="fas fa-circle-nodes text-[#FF3B30] text-xs animate-pulse"></i> <span>Kitchen: ${location.kitchen}</span>`;
    }
  });

  subscribe('cartNotification', (notif) => {
    showToast(notif.message, notif.type);
    
    // Play quick scale-bounce animation on the cart navigation button
    if (cartBtn) {
      cartBtn.classList.add('animate-cart-bounce');
      setTimeout(() => cartBtn.classList.remove('animate-cart-bounce'), 300);
    }
  });

  subscribe('orderStarted', () => {
    showToast('Order confirmed. Telemetry active!', 'add');
    // Highlight tracking indicator on navigation header
    if (trackerBtn) {
      trackerBtn.classList.remove('opacity-40');
      trackerBtn.classList.add('text-[#FF3B30]');
    }
  });

  subscribe('stateChange', (state) => {
    // If order was reset, reset tracking nav highlight
    if (!state.orderActive) {
      if (trackerBtn) {
        trackerBtn.classList.add('opacity-40');
        trackerBtn.classList.remove('text-[#FF3B30]');
      }
    }
  });
});
